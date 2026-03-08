import { describe, it, expect } from 'vitest';
import { get, readable, writable } from 'svelte/store';
import { createSpotr } from '../src/svelte';
import { defaultOptions, type Person } from './fixtures';
import type { SpotrOptions } from '../src/types';

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

  it('creates derived store when options is a Readable store', () => {
    const optionsStore = readable<SpotrOptions<Person>>(defaultOptions);
    const spotrStore = createSpotr(optionsStore);
    const spotr = get(spotrStore);
    expect(spotr).toHaveProperty('query');
    expect(typeof spotr.query).toBe('function');
    const result = spotr.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('recreates Spotr when Readable store options change', () => {
    const writableOptions = writable<SpotrOptions<Person>>(defaultOptions);
    const spotrStore = createSpotr(writableOptions);
    const spotr1 = get(spotrStore);
    expect(spotr1.query('alice').results.length).toBeGreaterThan(0);

    const differentPeople: Person[] = [
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
    ];
    writableOptions.set({
      collection: differentPeople,
      fields: ['firstName', 'lastName'],
    });
    const spotr2 = get(spotrStore);
    expect(spotr2).not.toBe(spotr1);
    expect(spotr2.collection).toHaveLength(1);
    expect(spotr2.collection[0].firstName).toBe('Charlie');
    const result = spotr2.query('charlie');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Charlie');
  });
});
