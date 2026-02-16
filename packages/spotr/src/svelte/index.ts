import { writable, derived } from 'svelte/store';
import { Spotr } from '../Spotr';
import type { SpotrOptions } from '../types';

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
