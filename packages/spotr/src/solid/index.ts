import { createMemo } from 'solid-js';
import { Spotr } from '../Spotr';
import type { SpotrOptions, ExtractItemType } from '../types';

// Overload: infer T from collection
export function createSpotr<
  C extends readonly object[] | object[] | Set<object>,
>(
  options:
    | (Omit<SpotrOptions<ExtractItemType<C>>, 'collection'> & { collection: C })
    | (() => Omit<SpotrOptions<ExtractItemType<C>>, 'collection'> & {
        collection: C;
      })
): () => Spotr<ExtractItemType<C> & object>;
// Overload: explicit generic
export function createSpotr<T extends object>(
  options: SpotrOptions<T> | (() => SpotrOptions<T>)
): () => Spotr<T>;
export function createSpotr<T extends object>(
  options: SpotrOptions<T> | (() => SpotrOptions<T>)
): () => Spotr<T> {
  return createMemo(() => {
    const opts = typeof options === 'function' ? options() : options;
    return new Spotr(opts);
  }) as () => Spotr<T>;
}

export { Spotr } from '../Spotr';
export type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
} from '../types';
