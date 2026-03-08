import { describe, it, expect } from 'vitest';
import { levenshteinDistance, fuzzyScore } from '../src/fuzzy/levenshtein';

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
    expect(fuzzyScore('hello', 'hello')).toBe(1);
  });

  it('returns 0 for empty query or target', () => {
    expect(fuzzyScore('', 'hello')).toBe(0);
    expect(fuzzyScore('hello', '')).toBe(0);
  });

  it('returns high score for substring match', () => {
    const score = fuzzyScore('ell', 'hello');
    expect(score).toBeGreaterThan(0.9);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('calculates substring score using exact formula', () => {
    // Formula: 0.9 + (0.1 * queryLen) / targetLen
    // For 'ell' (3 chars) in 'hello' (5 chars): 0.9 + (0.1 * 3) / 5 = 0.9 + 0.06 = 0.96
    const score = fuzzyScore('ell', 'hello');
    const expectedScore = 0.9 + (0.1 * 3) / 5;
    expect(score).toBeCloseTo(expectedScore, 10);
    expect(score).toBeCloseTo(0.96, 10);
  });

  it('returns 0 for score below threshold', () => {
    expect(fuzzyScore('xyz', 'hello', 0.5)).toBe(0);
  });

  it('accepts pre-normalized strings (caller handles case)', () => {
    expect(fuzzyScore('hello', 'hello', 0.3)).toBe(1);
    expect(fuzzyScore('HELLO', 'hello', 0.3)).toBe(0);
  });

  it('scores correctly with normalized strings', () => {
    const score = fuzzyScore('helo', 'hello', 0.3);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  describe('threshold boundaries', () => {
    it('returns non-zero score when score equals threshold', () => {
      // 'helo' vs 'hello' has Levenshtein distance 1, maxLen 5
      // Score = 1 - 1/5 = 0.8
      // With threshold 0.8, should return 0.8 (not 0)
      const score = fuzzyScore('helo', 'hello', 0.8);
      expect(score).toBe(0.8);
      expect(score).toBeGreaterThan(0);
    });

    it('returns 0 when score is just below threshold', () => {
      // 'helo' vs 'hello' has score 0.8
      // With threshold 0.81, should return 0
      const score = fuzzyScore('helo', 'hello', 0.81);
      expect(score).toBe(0);
    });

    it('respects custom threshold for Levenshtein-based scores', () => {
      // 'xyz' vs 'hello' has Levenshtein distance 5, maxLen 5
      // Score = 1 - 5/5 = 0
      // With threshold 0.3, should return 0
      const scoreLow = fuzzyScore('xyz', 'hello', 0.3);
      expect(scoreLow).toBe(0);

      // 'helo' vs 'hello' has score 0.8
      // With threshold 0.5, should return 0.8
      const scoreHigh = fuzzyScore('helo', 'hello', 0.5);
      expect(scoreHigh).toBe(0.8);
    });
  });
});
