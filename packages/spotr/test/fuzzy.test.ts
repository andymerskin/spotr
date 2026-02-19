import { describe, it, expect } from 'vitest';
import { levenshteinDistance, fuzzyScore } from '../src/fuzzy/levenshtein';
import { MAX_STRING_LENGTH } from '../src/types';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns length of other string for empty string', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  it('calculates single character insertion', () => {
    expect(levenshteinDistance('hello', 'helo')).toBe(1);
  });

  it('calculates single character deletion', () => {
    expect(levenshteinDistance('helo', 'hello')).toBe(1);
  });

  it('calculates single character substitution', () => {
    expect(levenshteinDistance('hello', 'hallo')).toBe(1);
  });

  it('calculates multiple edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });
});

describe('fuzzyScore', () => {
  it('returns 1 for exact match', () => {
    const result = fuzzyScore('hello', 'hello');
    expect(result.score).toBe(1);
    expect(result.warnings).toEqual([]);
  });

  it('returns 0 for empty query or target', () => {
    expect(fuzzyScore('', 'hello').score).toBe(0);
    expect(fuzzyScore('hello', '').score).toBe(0);
  });

  it('returns high score for substring match', () => {
    const result = fuzzyScore('ell', 'hello');
    expect(result.score).toBeGreaterThan(0.9);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('returns 0 for score below threshold', () => {
    expect(fuzzyScore('xyz', 'hello', 0.5).score).toBe(0);
  });

  it('respects case sensitivity', () => {
    expect(fuzzyScore('HELLO', 'hello', 0.3, false).score).toBe(1);
    expect(fuzzyScore('HELLO', 'hello', 0.3, true).score).toBe(0);
  });

  describe('maxStringLength', () => {
    it('returns no warnings when strings are within limit', () => {
      const result = fuzzyScore('hello', 'world');
      expect(result.warnings).toEqual([]);
    });

    it('truncates query string exceeding limit and returns warning', () => {
      const longQuery = 'a'.repeat(1500);
      const result = fuzzyScore(longQuery, 'hello', 0.3, false, 1000);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Query string truncated');
      expect(result.warnings[0]).toContain('1500');
      expect(result.warnings[0]).toContain('1000');
    });

    it('truncates target string exceeding limit and returns warning', () => {
      const longTarget = 'b'.repeat(1500);
      const result = fuzzyScore('hello', longTarget, 0.3, false, 1000);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Target string truncated');
      expect(result.warnings[0]).toContain('1500');
      expect(result.warnings[0]).toContain('1000');
    });

    it('truncates both strings when both exceed limit', () => {
      const longQuery = 'a'.repeat(2000);
      const longTarget = 'b'.repeat(2000);
      const result = fuzzyScore(longQuery, longTarget, 0.3, false, 1000);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain('Query string truncated');
      expect(result.warnings[1]).toContain('Target string truncated');
    });

    it('uses default MAX_STRING_LENGTH when not specified', () => {
      const longQuery = 'a'.repeat(MAX_STRING_LENGTH + 500);
      const result = fuzzyScore(longQuery, 'hello');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain(String(MAX_STRING_LENGTH));
    });

    it('scores correctly after truncation', () => {
      const base = 'hello';
      const longTarget = base + 'x'.repeat(2000);
      const result = fuzzyScore('hello', longTarget, 0.3, false, 1000);
      expect(result.score).toBeGreaterThan(0.9);
      expect(result.warnings).toHaveLength(1);
    });

    it('exact match returns score 1 even with truncation', () => {
      const longString = 'a'.repeat(1500);
      const result = fuzzyScore(longString, longString, 0.3, false, 1000);
      expect(result.score).toBe(1);
      expect(result.warnings).toHaveLength(2);
    });
  });
});
