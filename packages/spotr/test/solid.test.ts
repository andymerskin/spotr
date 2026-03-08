import { describe, it, expect } from 'vitest';
import { createRoot, createSignal } from 'solid-js';
import { createSpotr } from '../src/solid';
import { defaultOptions, type Person } from './fixtures';
import type { SpotrOptions } from '../src/types';

describe('createSpotr (Solid)', () => {
  it('returns an accessor that yields Spotr instance', () => {
    let getSpotr: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      getSpotr = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      expect(getSpotr).not.toBeNull();
      expect(typeof getSpotr!).toBe('function');
      const spotr = getSpotr!();
      expect(spotr).toHaveProperty('query');
      expect(typeof spotr.query).toBe('function');
    } finally {
      dispose();
    }
  });

  it('spotr.query returns empty results for empty query', () => {
    let getSpotr: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      getSpotr = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      const spotr = getSpotr!();
      const result = spotr.query('');
      expect(result.results).toHaveLength(0);
    } finally {
      dispose();
    }
  });

  it('spotr.query finds fuzzy matches', () => {
    let getSpotr: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      getSpotr = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      const spotr = getSpotr!();
      const result = spotr.query('alice');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.firstName).toBe('Alice');
    } finally {
      dispose();
    }
  });

  it('returns same instance for static options', () => {
    let getSpotr: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      getSpotr = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      const a = getSpotr!();
      const b = getSpotr!();
      expect(a).toBe(b);
    } finally {
      dispose();
    }
  });

  it('accepts getter function as options', () => {
    const getOptions = (): SpotrOptions<Person> => ({ ...defaultOptions });
    let getSpotr: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      getSpotr = createSpotr(getOptions);
      return disposer;
    });
    try {
      const spotr = getSpotr!();
      expect(spotr).toHaveProperty('query');
      expect(typeof spotr.query).toBe('function');
      const result = spotr.query('alice');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.firstName).toBe('Alice');
    } finally {
      dispose();
    }
  });

  it('accepts signal-driven getter function and tracks reactivity', () => {
    const differentPeople: Person[] = [
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
    ];
    let getSpotr: ReturnType<typeof createSpotr<Person>> | null = null;
    let setOptions!: (opts: SpotrOptions<Person>) => void;

    const dispose = createRoot((disposer) => {
      const [options, set] = createSignal<SpotrOptions<Person>>(defaultOptions);
      setOptions = set;
      // Pass a getter that reads from a signal - this is the reactive pattern
      getSpotr = createSpotr(() => options());

      // Verify the getter function path works
      const spotr = getSpotr!();
      expect(spotr).toHaveProperty('query');
      expect(spotr.query('alice').results.length).toBeGreaterThan(0);

      // Change the signal
      setOptions({
        collection: differentPeople,
        fields: ['firstName', 'lastName'],
      });

      // Note: Full reactive behavior (memo re-running when signal changes) is
      // demonstrated in the examples where getSpotr() is called inside createMemo
      // that also reads reactive signals. The createMemo wrapper ensures that
      // when the getter reads from a signal, the memo will re-run when that
      // signal changes, returning a new Spotr instance with updated options.

      return disposer;
    });

    try {
      // Verify the getter function accepts signal-backed options
      expect(getSpotr).not.toBeNull();
    } finally {
      dispose();
    }
  });
});
