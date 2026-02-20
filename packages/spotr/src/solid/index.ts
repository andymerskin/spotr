import { createSignal, createMemo } from 'solid-js';
import { Spotr } from '../Spotr';
import type { SpotrOptions, ExtractItemType } from '../types';

// Overload: infer T from collection
export function createSpotr<
  C extends readonly object[] | object[] | Set<object>,
>(
  options: Omit<SpotrOptions<ExtractItemType<C>>, 'collection'> & {
    collection: C;
  }
): {
  query: () => string;
  setQuery: (query: string) => void;
  results: () => import('../types').SpotrResult<ExtractItemType<C> & object>;
};
// Overload: explicit generic
export function createSpotr<T extends object>(
  options: SpotrOptions<T>
): {
  query: () => string;
  setQuery: (query: string) => void;
  results: () => import('../types').SpotrResult<T>;
};
export function createSpotr<T extends object>(options: SpotrOptions<T>) {
  const spotr = new Spotr(options);
  const [query, setQuery] = createSignal('');
  const results = createMemo(() => spotr.query(query()));
  return { query, setQuery, results };
}

export { Spotr } from '../Spotr';
export type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
} from '../types';
