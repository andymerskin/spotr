export const MAX_STRING_LENGTH = 1000;

export type FieldConfig =
  | string
  | {
      name: string;
      weight?: number;
      threshold?: number;
    };

export type KeywordDefinition<T> = {
  name: string;
  triggers: string | string[];
  /**
   * Custom filter function for keyword-based collection filtering.
   *
   * @param collection - The current collection to filter
   * @param matchedTerms - The trigger terms that matched this keyword
   * @returns Filtered collection array
   *
   * @security Handler functions execute with full access to the collection
   * and any data it contains. Only use trusted handler implementations.
   * Avoid executing untrusted code or exposing sensitive data through handlers.
   */
  handler: (collection: T[], matchedTerms: string[]) => T[];
};

export type KeywordsConfig<T> =
  | KeywordDefinition<T>[]
  | {
      mode?: 'and' | 'or';
      definitions: KeywordDefinition<T>[];
    };

export interface SpotrOptions<T extends object> {
  collection: T[] | Set<T>;
  fields: FieldConfig[];
  keywords?: KeywordsConfig<T>;
  threshold?: number;
  limit?: number;
  debounce?: number;
  caseSensitive?: boolean;
  minMatchCharLength?: number;
  maxStringLength?: number;
}

export interface ScoredResult<T> {
  item: T;
  score: number;
}

export interface MatchedKeyword {
  name: string;
  terms: string[];
}

export interface SpotrResult<T> {
  results: ScoredResult<T>[];
  matchedKeywords: MatchedKeyword[];
  tokens: string[];
  warnings: string[];
}

export interface NormalizedFieldConfig {
  name: string;
  weight: number;
  threshold: number;
}

export interface NormalizedKeywordsConfig {
  mode: 'and' | 'or';
  definitions: KeywordDefinition<unknown>[];
}
