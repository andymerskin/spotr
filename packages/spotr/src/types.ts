export const MAX_STRING_LENGTH = 1000;

/**
 * Extracts the element type from a collection type.
 * @internal
 */
export type ExtractItemType<C> =
  C extends Set<infer T>
    ? T
    : C extends readonly (infer T)[]
      ? T
      : C extends (infer T)[]
        ? T
        : never;

export type FieldConfig =
  | string
  | {
      name: string;
      weight?: number;
      threshold?: number;
    };

export type KeywordMode = 'and' | 'or';

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
      mode?: KeywordMode;
      definitions: KeywordDefinition<T>[];
    };

export interface SpotrOptions<T extends object> {
  collection: readonly T[] | T[] | Set<T>;
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
  mode: KeywordMode;
  definitions: KeywordDefinition<unknown>[];
}
