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

  it('returns 0 for score below threshold', () => {
    expect(fuzzyScore('xyz', 'hello', 0.5)).toBe(0);
  });

  it('respects case sensitivity', () => {
    expect(fuzzyScore('HELLO', 'hello', 0.3, false)).toBe(1);
    expect(fuzzyScore('HELLO', 'hello', 0.3, true)).toBe(0);
  });
});
