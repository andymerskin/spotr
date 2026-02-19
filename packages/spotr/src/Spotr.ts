import { normalizeFieldConfig, scoreItem } from './fuzzy';
import {
  tokenize,
  validateOptions,
  validateKeywords,
  validateCollection,
} from './utils';
import type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
  NormalizedFieldConfig,
  NormalizedKeywordsConfig,
  KeywordDefinition,
} from './types';

export class Spotr<T extends object> {
  private _collection: T[];
  private _fields: NormalizedFieldConfig[];
  private _keywords: NormalizedKeywordsConfig | null;
  private _keywordTriggerMap: Map<string, KeywordDefinition<unknown>>;
  private _threshold: number;
  private _limit: number;
  private _debounce: number;
  private _caseSensitive: boolean;
  private _minMatchCharLength: number;
  private _maxStringLength: number;
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _optionsSnapshot: SpotrOptions<T>;

  constructor(options: SpotrOptions<T>) {
    this._optionsSnapshot = options;
    const validated = validateOptions(options);
    this._collection = validated.collection;
    this._threshold = validated.threshold;
    this._limit = validated.limit;
    this._debounce = validated.debounce;
    this._caseSensitive = validated.caseSensitive;
    this._minMatchCharLength = validated.minMatchCharLength;
    this._maxStringLength = validated.maxStringLength;

    this._fields = normalizeFieldConfig(options.fields, this._threshold);

    this._keywords = options.keywords
      ? validateKeywords(options.keywords)
      : null;
    this._keywordTriggerMap = this._buildKeywordTriggerMap();
  }

  private _buildKeywordTriggerMap(): Map<string, KeywordDefinition<unknown>> {
    const map = new Map<string, KeywordDefinition<unknown>>();
    if (!this._keywords) return map;

    for (const def of this._keywords.definitions) {
      const triggers = Array.isArray(def.triggers)
        ? def.triggers
        : [def.triggers];
      for (const trigger of triggers) {
        map.set(trigger.toLowerCase(), def);
      }
    }
    return map;
  }

  get collection(): T[] {
    return this._collection;
  }

  get options(): SpotrOptions<T> {
    return this._optionsSnapshot;
  }

  setCollection(collection: T[] | Set<T>): void {
    this._collection = validateCollection(collection as unknown) as T[];
  }

  query(search: string): SpotrResult<T> {
    const tokens = tokenize(search);

    if (tokens.length === 0) {
      return {
        results: [],
        matchedKeywords: [],
        tokens: [],
        warnings: [],
      };
    }

    const { keywordTokens, searchTokens } = this._extractKeywords(tokens);

    let filteredCollection = this._collection;
    const matchedKeywords: MatchedKeyword[] = [];

    if (keywordTokens.size > 0) {
      const result = this._applyKeywords(filteredCollection, keywordTokens);
      filteredCollection = result.collection;
      matchedKeywords.push(...result.matchedKeywords);
    }

    if (searchTokens.length === 0) {
      const allWarnings: string[] = [];
      const results: ScoredResult<T>[] = filteredCollection.map((item) => {
        const { score, warnings } = scoreItem(
          item,
          [],
          this._fields,
          this._caseSensitive,
          this._maxStringLength
        );
        allWarnings.push(...warnings);
        return { item, score };
      });

      return {
        results,
        matchedKeywords,
        tokens: searchTokens,
        warnings: [...new Set(allWarnings)],
      };
    }

    const validTokens =
      this._minMatchCharLength > 1
        ? searchTokens.filter((t) => t.length >= this._minMatchCharLength)
        : searchTokens;

    if (validTokens.length === 0) {
      return {
        results: [],
        matchedKeywords,
        tokens: searchTokens,
        warnings: [],
      };
    }

    const allWarnings: string[] = [];
    const scoredResults: ScoredResult<T>[] = [];

    for (const item of filteredCollection) {
      const { score, warnings } = scoreItem(
        item,
        validTokens,
        this._fields,
        this._caseSensitive,
        this._maxStringLength
      );
      allWarnings.push(...warnings);

      if (score > 0) {
        scoredResults.push({ item, score });
      }
    }

    scoredResults.sort((a, b) => b.score - a.score);

    const limitedResults =
      this._limit < Infinity
        ? scoredResults.slice(0, this._limit)
        : scoredResults;

    return {
      results: limitedResults,
      matchedKeywords,
      tokens: searchTokens,
      warnings: [...new Set(allWarnings)],
    };
  }

  queryAsync(search: string): Promise<SpotrResult<T>> {
    return new Promise((resolve) => {
      if (this._debounce > 0) {
        if (this._debounceTimer) {
          clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
          resolve(this.query(search));
        }, this._debounce);
      } else {
        resolve(this.query(search));
      }
    });
  }

  private _extractKeywords(tokens: string[]): {
    keywordTokens: Map<string, string[]>;
    searchTokens: string[];
  } {
    const keywordTokens = new Map<string, string[]>();
    const searchTokens: string[] = [];

    for (const token of tokens) {
      const normalizedToken = this._caseSensitive ? token : token.toLowerCase();
      const keywordDef = this._keywordTriggerMap.get(normalizedToken);

      if (keywordDef) {
        const existing = keywordTokens.get(keywordDef.name) || [];
        existing.push(token);
        keywordTokens.set(keywordDef.name, existing);
      } else {
        searchTokens.push(token);
      }
    }

    return { keywordTokens, searchTokens };
  }

  private _applyKeywords(
    collection: T[],
    keywordTokens: Map<string, string[]>
  ): { collection: T[]; matchedKeywords: MatchedKeyword[] } {
    if (!this._keywords) {
      return { collection, matchedKeywords: [] };
    }

    let result = collection;
    const matchedKeywords: MatchedKeyword[] = [];

    const keywordNameToTerms = new Map<string, string[]>();
    for (const [name, terms] of keywordTokens) {
      keywordNameToTerms.set(name, terms);
    }

    if (this._keywords.mode === 'and') {
      for (const def of this._keywords.definitions) {
        const terms = keywordNameToTerms.get(def.name);
        if (terms) {
          const handler = def.handler as (
            collection: T[],
            matchedTerms: string[]
          ) => T[];
          const handlerResult = handler(result, terms);

          if (!Array.isArray(handlerResult)) {
            console.error(
              `[Spotr] Keyword handler "${def.name}" must return an array, received ${typeof handlerResult}. Skipping this filter.`
            );
            // Skip this keyword - keep current collection for this step
            continue;
          }

          result = handlerResult;
          matchedKeywords.push({ name: def.name, terms });
        }
      }
    } else {
      const mergedResults: T[] = [];
      const processedItems = new Set<T>();

      for (const def of this._keywords.definitions) {
        const terms = keywordNameToTerms.get(def.name);
        if (terms) {
          const handler = def.handler as (
            collection: T[],
            matchedTerms: string[]
          ) => T[];
          const keywordResults = handler(this._collection, terms);

          if (!Array.isArray(keywordResults)) {
            console.error(
              `[Spotr] Keyword handler "${def.name}" must return an array, received ${typeof keywordResults}. Skipping this filter.`
            );
            // Skip this keyword - don't add its results
            continue;
          }

          matchedKeywords.push({ name: def.name, terms });

          for (const item of keywordResults) {
            if (!processedItems.has(item)) {
              processedItems.add(item);
              mergedResults.push(item);
            }
          }
        }
      }
      result = mergedResults;
    }

    return { collection: result, matchedKeywords };
  }
}
