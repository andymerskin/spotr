import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createSpotr } from '../src/svelte';
import { defaultOptions, type Person } from './fixtures';

describe('createSpotr (Svelte)', () => {
  it('returns spotr, query, and results', () => {
    const { spotr, query, results } = createSpotr<Person>(defaultOptions);
    expect(spotr).toHaveProperty('query');
    expect(typeof spotr.query).toBe('function');
    expect(query).toBeDefined();
    expect(results).toBeDefined();
  });

  it('spotr.query returns empty results for empty query', () => {
    const { spotr } = createSpotr<Person>(defaultOptions);
    const result = spotr.query('');
    expect(result.results).toHaveLength(0);
  });

  it('spotr.query finds fuzzy matches', () => {
    const { spotr } = createSpotr<Person>(defaultOptions);
    const result = spotr.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Alice');
  });

  it('results store updates when query store is set', () => {
    const { query, results } = createSpotr<Person>(defaultOptions);
    const initial = get(results);
    expect(initial.results).toHaveLength(0);

    query.set('alice');
    const after = get(results);
    expect(after.results.length).toBeGreaterThan(0);
    expect(after.results[0].item.firstName).toBe('Alice');
  });

  it('results store returns empty when query is cleared', () => {
    const { query, results } = createSpotr<Person>(defaultOptions);
    query.set('alice');
    expect(get(results).results.length).toBeGreaterThan(0);

    query.set('');
    expect(get(results).results).toHaveLength(0);
  });

  it('results store updates with different queries', () => {
    const { query, results } = createSpotr<Person>(defaultOptions);

    query.set('alice');
    const result1 = get(results);
    expect(result1.results.length).toBeGreaterThan(0);
    expect(result1.results[0].item.firstName).toBe('Alice');

    query.set('bob');
    const result2 = get(results);
    expect(result2.results.length).toBeGreaterThan(0);
    expect(result2.results[0].item.firstName).toBe('Bob');
  });

  it('results store returns empty for no matches', () => {
    const { query, results } = createSpotr<Person>(defaultOptions);
    query.set('xyznonexistent');
    expect(get(results).results).toHaveLength(0);
  });

  it('query store can be subscribed to', () => {
    const { query } = createSpotr<Person>(defaultOptions);
    let currentValue = '';
    const unsubscribe = query.subscribe((value) => {
      currentValue = value;
    });
    expect(currentValue).toBe('');
    query.set('test');
    expect(currentValue).toBe('test');
    unsubscribe();
  });
});
