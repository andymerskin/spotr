import { useRef } from 'preact/hooks';
import { Spotr } from '../Spotr';
import type { SpotrOptions } from '../types';

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      (a as Record<string, unknown>)[key] !==
      (b as Record<string, unknown>)[key]
    ) {
      return false;
    }
  }

  return true;
}

export function useSpotr<T extends object>(options: SpotrOptions<T>): Spotr<T> {
  const optionsRef = useRef(options);

  if (!shallowEqual(optionsRef.current, options)) {
    optionsRef.current = options;
  }

  const spotrRef = useRef<Spotr<T> | null>(null);

  if (!spotrRef.current || spotrRef.current.options !== optionsRef.current) {
    spotrRef.current = new Spotr(optionsRef.current);
  }

  return spotrRef.current;
}

export { Spotr } from '../Spotr';
export type {
  SpotrOptions,
  SpotrResult,
  ScoredResult,
  MatchedKeyword,
} from '../types';
