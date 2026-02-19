/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { useSpotr } from '../src/preact';
import type { SpotrOptions } from '../src/types';
import type { Person } from './fixtures';

const preactOptions: SpotrOptions<Person> = {
  collection: [
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice@acme.com' },
    { firstName: 'Bob', lastName: 'Smith', email: 'bob@globex.com' },
  ],
  fields: ['firstName', 'lastName'],
};

function TestComponent({
  options,
  spotrRef,
}: {
  options: SpotrOptions<Person>;
  spotrRef?: { current: ReturnType<typeof useSpotr<Person>> | null };
}) {
  const spotr = useSpotr(options);
  if (spotrRef) spotrRef.current = spotr;
  const empty = spotr.query('').results.length;
  const alice = spotr.query('alice').results;
  const firstName = alice.length > 0 ? alice[0].item.firstName : '';
  return (
    <div>
      <span data-testid="empty-count">{String(empty)}</span>
      <span data-testid="alice-count">{String(alice.length)}</span>
      <span data-testid="first-name">{firstName}</span>
    </div>
  );
}

describe('useSpotr (Preact)', () => {
  it('returns a Spotr instance that reports empty results for empty query', () => {
    const { unmount } = render(<TestComponent options={preactOptions} />);
    expect(screen.getByTestId('empty-count').textContent).toBe('0');
    unmount();
  });

  it('finds fuzzy matches', () => {
    const { unmount } = render(<TestComponent options={preactOptions} />);
    expect(screen.getByTestId('alice-count').textContent).toBe('1');
    expect(screen.getByTestId('first-name').textContent).toBe('Alice');
    unmount();
  });

  it('recreates Spotr when options change (different collection)', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    const differentPeople: Person[] = [
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
    ];
    const { rerender, unmount } = render(
      <TestComponent options={preactOptions} spotrRef={spotrRef} />
    );
    const spotr1 = spotrRef.current!;
    const result1 = spotr1.query('alice');
    expect(result1.results.length).toBeGreaterThan(0);

    rerender(
      <TestComponent
        options={{ ...preactOptions, collection: differentPeople }}
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
    unmount();
  });

  it('recreates Spotr when options change (different fields)', () => {
    const spotrRef = {
      current: null as ReturnType<typeof useSpotr<Person>> | null,
    };
    const { rerender, unmount } = render(
      <TestComponent options={preactOptions} spotrRef={spotrRef} />
    );
    const spotr1 = spotrRef.current!;
    const result1 = spotr1.query('johnson');
    expect(result1.results.length).toBeGreaterThan(0);

    rerender(
      <TestComponent
        options={{ ...preactOptions, fields: ['email'] as const }}
        spotrRef={spotrRef}
      />
    );
    const spotr2 = spotrRef.current!;
    expect(spotr2).not.toBe(spotr1);
    const result2 = spotr2.query('johnson');
    expect(result2.results).toHaveLength(0);
    const emailResult = spotr2.query('alice@acme');
    expect(emailResult.results.length).toBeGreaterThan(0);
    unmount();
  });
});
