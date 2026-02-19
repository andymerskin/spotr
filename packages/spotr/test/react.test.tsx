/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useSpotr } from '../src/react';
import type { SpotrOptions } from '../src/types';
import { defaultOptions, type Person } from './fixtures';

function TestComponent({
  options,
  spotrRef,
}: {
  options: SpotrOptions<Person>;
  spotrRef: React.MutableRefObject<ReturnType<typeof useSpotr<Person>> | null>;
}) {
  const spotr = useSpotr(options);
  spotrRef.current = spotr;
  return null;
}

describe('useSpotr (React)', () => {
  it('returns a Spotr instance', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    render(<TestComponent options={defaultOptions} spotrRef={spotrRef} />);
    expect(spotrRef.current).not.toBeNull();
    expect(spotrRef.current).toHaveProperty('query');
    expect(typeof spotrRef.current?.query).toBe('function');
  });

  it('returns empty results for empty query', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    render(<TestComponent options={defaultOptions} spotrRef={spotrRef} />);
    const result = spotrRef.current!.query('');
    expect(result.results).toHaveLength(0);
  });

  it('finds fuzzy matches', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    render(<TestComponent options={defaultOptions} spotrRef={spotrRef} />);
    const result = spotrRef.current!.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Alice');
  });

  it('recreates Spotr when options change (different collection)', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    const differentPeople: Person[] = [
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
    ];
    const { rerender } = render(
      <TestComponent options={defaultOptions} spotrRef={spotrRef} />
    );
    const spotr1 = spotrRef.current!;
    const result1 = spotr1.query('alice');
    expect(result1.results.length).toBeGreaterThan(0);

    rerender(
      <TestComponent
        options={{ ...defaultOptions, collection: differentPeople }}
        spotrRef={spotrRef}
      />
    );
    const spotr2 = spotrRef.current!;
    expect(spotr2).not.toBe(spotr1);
    expect(spotr2.collection).toHaveLength(1);
    expect(spotr2.collection[0].firstName).toBe('Charlie');
    const charlieResult = spotr2.query('charlie');
    expect(charlieResult.results.length).toBeGreaterThan(0);
    expect(charlieResult.results[0].item.firstName).toBe('Charlie');
  });

  it('recreates Spotr when options change (different fields)', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    const { rerender } = render(
      <TestComponent options={defaultOptions} spotrRef={spotrRef} />
    );
    const spotr1 = spotrRef.current!;
    const result1 = spotr1.query('johnson');
    expect(result1.results.length).toBeGreaterThan(0);

    rerender(
      <TestComponent
        options={{ ...defaultOptions, fields: ['email'] as const }}
        spotrRef={spotrRef}
      />
    );
    const spotr2 = spotrRef.current!;
    expect(spotr2).not.toBe(spotr1);
    const result2 = spotr2.query('johnson');
    expect(result2.results).toHaveLength(0);
    const emailResult = spotr2.query('alice@acme');
    expect(emailResult.results.length).toBeGreaterThan(0);
  });
});
