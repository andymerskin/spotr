import { shallowRef, watch, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { Spotr } from '../Spotr';
import type { SpotrOptions, ExtractItemType } from '../types';

// Overload: infer T from collection
export function useSpotr<C extends readonly object[] | object[] | Set<object>>(
  options: MaybeRefOrGetter<
    Omit<SpotrOptions<ExtractItemType<C>>, 'collection'> & {
      collection: C;
    }
  >
): import('vue').ShallowRef<Spotr<ExtractItemType<C> & object> | null>;
// Overload: explicit generic
export function useSpotr<T extends object>(
  options: MaybeRefOrGetter<SpotrOptions<T>>
): import('vue').ShallowRef<Spotr<T> | null>;
export function useSpotr<T extends object>(
  options: MaybeRefOrGetter<SpotrOptions<T>>
) {
  const spotr = shallowRef<Spotr<T> | null>(null);

  watch(
    () => toValue(options),
    (newOptions) => {
      spotr.value = new Spotr(newOptions);
    },
    { immediate: true, deep: true }
  );

  return spotr;
}

export { Spotr } from '../Spotr';
export type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
} from '../types';
