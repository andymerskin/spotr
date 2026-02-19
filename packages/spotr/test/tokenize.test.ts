import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/utils/tokenize';

describe('tokenize', () => {
  it('splits multi-word query', () => {
    expect(tokenize('foo bar baz')).toEqual(['foo', 'bar', 'baz']);
  });

  it('returns single word', () => {
    expect(tokenize('hello')).toEqual(['hello']);
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(tokenize('   \n\t  ')).toEqual([]);
  });

  it('trims leading and trailing spaces', () => {
    expect(tokenize('  foo bar  ')).toEqual(['foo', 'bar']);
  });

  it('collapses multiple spaces', () => {
    expect(tokenize('foo   bar')).toEqual(['foo', 'bar']);
  });
});
