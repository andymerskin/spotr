import { shallowRef, watch, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { Spotr } from '../Spotr';
import type { SpotrOptions } from '../types';

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
export type { SpotrOptions, SpotrResult, ScoredResult, MatchedKeyword } from '../types';
