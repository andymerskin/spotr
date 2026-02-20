import { writable, derived } from 'svelte/store';
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
  spotr: Spotr<ExtractItemType<C> & object>;
  query: import('svelte/store').Writable<string>;
  results: import('svelte/store').Readable<
    import('../types').SpotrResult<ExtractItemType<C> & object>
  >;
};
// Overload: explicit generic
export function createSpotr<T extends object>(
  options: SpotrOptions<T>
): {
  spotr: Spotr<T>;
  query: import('svelte/store').Writable<string>;
  results: import('svelte/store').Readable<import('../types').SpotrResult<T>>;
};
export function createSpotr<T extends object>(options: SpotrOptions<T>) {
  const spotr = new Spotr(options);
  const query = writable('');
  const results = derived(query, ($query: string) => spotr.query($query));
  return { spotr, query, results };
}

export { Spotr } from '../Spotr';
export type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
} from '../types';
