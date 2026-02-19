import { describe, it, expect } from 'vitest';
import { createRoot, type Accessor } from 'solid-js';
import { createSpotr } from '../src/solid';
import { defaultOptions, type Person } from './fixtures';
import type { SpotrResult } from '../src/types';

describe('createSpotr (Solid)', () => {
  it('returns query, setQuery, and results', () => {
    let api: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      api = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      expect(api).not.toBeNull();
      expect(api!.query).toBeDefined();
      expect(api!.setQuery).toBeDefined();
      expect(api!.results).toBeDefined();
      expect(typeof api!.results).toBe('function');
    } finally {
      dispose();
    }
  });

  it('results() returns empty for initial empty query', () => {
    let results: Accessor<SpotrResult<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      const { results: r } = createSpotr(defaultOptions);
      results = r;
      return disposer;
    });
    try {
      expect(typeof results).toBe('function');
      expect(results!().results).toHaveLength(0);
    } finally {
      dispose();
    }
  });

  it('setQuery updates the query signal', () => {
    let api: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      api = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      expect(api!.query()).toBe('');
      api!.setQuery('alice');
      expect(api!.query()).toBe('alice');
      expect(api!.results().results).toBeDefined();
    } finally {
      dispose();
    }
  });

  it('results() returns matches for current query signal value', () => {
    let api: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      api = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      api!.setQuery('alice');
      const queryValue = api!.query();
      expect(queryValue).toBe('alice');
      expect(api!.results().results).toBeDefined();
    } finally {
      dispose();
    }
  });

  it('query signal can be updated multiple times', () => {
    let api: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      api = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      api!.setQuery('alice');
      expect(api!.query()).toBe('alice');
      api!.setQuery('bob');
      expect(api!.query()).toBe('bob');
      api!.setQuery('');
      expect(api!.query()).toBe('');
    } finally {
      dispose();
    }
  });

  it('returns empty results when query is empty', () => {
    let api: ReturnType<typeof createSpotr<Person>> | null = null;
    const dispose = createRoot((disposer) => {
      api = createSpotr(defaultOptions);
      return disposer;
    });
    try {
      api!.setQuery('');
      const result = api!.results();
      expect(result.results).toHaveLength(0);
    } finally {
      dispose();
    }
  });
});
