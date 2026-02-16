import { createSignal, createMemo } from 'solid-js';
import { Spotr } from '../Spotr';
import type { SpotrOptions } from '../types';

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
