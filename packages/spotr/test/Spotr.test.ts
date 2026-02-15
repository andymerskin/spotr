import { describe, it, expect } from 'vitest';
import { Spotr } from '../src/Spotr';
import { SpotrError, ErrorCodes } from '../src/errors';

interface Game {
  title: string;
  genres: string[];
  releaseYear: number;
  completed: boolean;
  metadata?: {
    developer?: string;
    publisher?: string;
  };
}

const games: Game[] = [
  { title: 'The Witcher 3', genres: ['rpg', 'action'], releaseYear: 2015, completed: true },
  { title: 'Elden Ring', genres: ['rpg', 'action'], releaseYear: 2022, completed: false },
  { title: 'Zelda: Breath of the Wild', genres: ['adventure', 'action'], releaseYear: 2017, completed: true },
];

interface Person {
  firstName: string;
  lastName: string;
  email: string;
  address?: {
    city: string;
    country: string;
  };
  company?: {
    name: string;
    location?: {
      city: string;
    };
  };
}

const people: Person[] = [
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice@acme.com' },
  { firstName: 'Bob', lastName: 'Smith', email: 'bob@globex.com' },
];

describe('Spotr', () => {
  describe('constructor validation', () => {
    it('throws for invalid collection', () => {
      expect(() => {
        new Spotr({ collection: 'invalid' as unknown as object[], fields: ['name'] });
      }).toThrow(SpotrError);
    });

    it('throws for empty fields', () => {
      expect(() => {
        new Spotr({ collection: [], fields: [] });
      }).toThrow(SpotrError);
    });

    it('throws for invalid weight', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: [{ name: 'firstName', weight: 2 }],
        });
      }).toThrow(SpotrError);
    });

    it('accepts Set as collection', () => {
      const spotr = new Spotr({ collection: new Set(people), fields: ['firstName'] });
      expect(spotr.collection).toHaveLength(2);
    });
  });

  describe('query', () => {
    it('returns empty results for empty query', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      const result = spotr.query('');
      expect(result.results).toHaveLength(0);
    });

    it('finds fuzzy matches', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: [{ name: 'title', weight: 1 }],
        threshold: 0.3,
      });
      const result = spotr.query('witcher');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.title).toBe('The Witcher 3');
    });

    it('respects limit', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        limit: 1,
      });
      const result = spotr.query('');
      expect(result.results.length).toBeLessThanOrEqual(1);
    });

    it('handles multiple tokens', () => {
      const spotr = new Spotr<Person>({
        collection: people,
        fields: ['firstName', 'lastName'],
      });
      const result = spotr.query('alice johnson');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('sorts by score descending', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      const result = spotr.query('zelda');
      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i - 1].score).toBeGreaterThanOrEqual(result.results[i].score);
      }
    });
  });

  describe('nested fields', () => {
    const peopleWithNested: Person[] = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@acme.com',
        address: { city: 'San Francisco', country: 'USA' },
        company: { name: 'Acme Corp', location: { city: 'San Francisco' } },
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@globex.com',
        address: { city: 'New York', country: 'USA' },
      },
    ];

    it('searches nested fields', () => {
      const spotr = new Spotr<Person>({
        collection: peopleWithNested,
        fields: [{ name: 'address.city', weight: 0.8 }],
      });
      const result = spotr.query('francisco');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.firstName).toBe('Alice');
    });

    it('searches deeply nested fields', () => {
      const spotr = new Spotr<Person>({
        collection: peopleWithNested,
        fields: [{ name: 'company.location.city', weight: 0.5 }],
      });
      const result = spotr.query('francisco');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('generates warning for missing nested path', () => {
      const spotr = new Spotr<Person>({
        collection: peopleWithNested,
        fields: [{ name: 'company.location.city', weight: 0.5 }],
      });
      const result = spotr.query('anything');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('keywords', () => {
    it('filters by keyword', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done', 'complete'],
            handler: (collection) => collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('done');
      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.matchedKeywords[0].name).toBe('completed');
      expect(result.results.every((r) => r.item.completed)).toBe(true);
    });

    it('combines keyword with fuzzy search', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done'],
            handler: (collection) => collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('witcher done');
      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.results[0].item.title).toBe('The Witcher 3');
      expect(result.results[0].item.completed).toBe(true);
    });

    it('supports keyword mode: and', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'and',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) => collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) => collection.filter((item) => item.releaseYear >= 2020),
            },
          ],
        },
      });
      const result = spotr.query('done recent');
      expect(result.matchedKeywords).toHaveLength(2);
    });

    it('supports keyword mode: or', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'or',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) => collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) => collection.filter((item) => item.releaseYear >= 2020),
            },
          ],
        },
      });
      const result = spotr.query('done recent');
      expect(result.matchedKeywords).toHaveLength(2);
    });
  });

  describe('setCollection', () => {
    it('updates collection', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      expect(spotr.collection).toHaveLength(3);

      spotr.setCollection([games[0]]);
      expect(spotr.collection).toHaveLength(1);
    });
  });

  describe('queryAsync', () => {
    it('returns promise with results', async () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      const result = await spotr.queryAsync('witcher');
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  describe('case sensitivity', () => {
    it('is case insensitive by default', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      const result = spotr.query('WITCHER');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('respects caseSensitive option', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        caseSensitive: true,
      });
      const result = spotr.query('WITCHER');
      expect(result.results.length).toBe(0);
    });
  });

  describe('minMatchCharLength', () => {
    it('filters short queries', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        minMatchCharLength: 3,
      });
      const result = spotr.query('ab');
      expect(result.results.length).toBe(0);
    });
  });
});
