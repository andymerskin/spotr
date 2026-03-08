import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createSpotr } from '../src/svelte';
import { defaultOptions, type Person } from './fixtures';

describe('createSpotr (Svelte)', () => {
  it('returns a Readable store of Spotr instance', () => {
    const spotrStore = createSpotr<Person>(defaultOptions);
    expect(spotrStore).toBeDefined();
    expect(typeof spotrStore.subscribe).toBe('function');
    const spotr = get(spotrStore);
    expect(spotr).toHaveProperty('query');
    expect(typeof spotr.query).toBe('function');
  });

  it('spotr.query returns empty results for empty query', () => {
    const spotrStore = createSpotr<Person>(defaultOptions);
    const spotr = get(spotrStore);
    const result = spotr.query('');
    expect(result.results).toHaveLength(0);
  });

  it('spotr.query finds fuzzy matches', () => {
    const spotrStore = createSpotr<Person>(defaultOptions);
    const spotr = get(spotrStore);
    const result = spotr.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Alice');
  });

  it('store can be subscribed to', () => {
    const spotrStore = createSpotr<Person>(defaultOptions);
    let received: unknown = null;
    const unsubscribe = spotrStore.subscribe((value) => {
      received = value;
    });
    expect(received).not.toBeNull();
    expect((received as { query: (s: string) => unknown }).query).toBeDefined();
    unsubscribe();
  });

  it('store returns same instance for static options', () => {
    const spotrStore = createSpotr<Person>(defaultOptions);
    const a = get(spotrStore);
    const b = get(spotrStore);
    expect(a).toBe(b);
  });
});
