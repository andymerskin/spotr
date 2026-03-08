import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { createSpotr } from '../src/solid';
import { defaultOptions, type Person } from './fixtures';

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
});
