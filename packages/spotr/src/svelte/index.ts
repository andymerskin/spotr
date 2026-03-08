import { readable, derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { Spotr } from '../Spotr';
import type { SpotrOptions, ExtractItemType } from '../types';

// Overload: infer T from collection
export function createSpotr<
  C extends readonly object[] | object[] | Set<object>,
>(
  options:
    | (Omit<SpotrOptions<ExtractItemType<C>>, 'collection'> & { collection: C })
    | Readable<
        Omit<SpotrOptions<ExtractItemType<C>>, 'collection'> & { collection: C }
      >
): Readable<Spotr<ExtractItemType<C> & object>>;
// Overload: explicit generic
export function createSpotr<T extends object>(
  options: SpotrOptions<T> | Readable<SpotrOptions<T>>
): Readable<Spotr<T>>;
export function createSpotr<T extends object>(
  options: SpotrOptions<T> | Readable<SpotrOptions<T>>
): Readable<Spotr<T>> {
  const hasSubscribe =
    options != null &&
    typeof (options as Readable<SpotrOptions<T>>).subscribe === 'function';

  if (hasSubscribe) {
    return derived(
      options as Readable<SpotrOptions<T>>,
      (opts) => new Spotr(opts)
    );
  }
  return readable(new Spotr(options as SpotrOptions<T>));
}

export { Spotr } from '../Spotr';
export type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
} from '../types';
