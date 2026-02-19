import { describe, it, expect } from 'vitest';
import { Spotr } from '../src/Spotr';
import { SpotrError } from '../src/errors';

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
  {
    title: 'The Witcher 3',
    genres: ['rpg', 'action'],
    releaseYear: 2015,
    completed: true,
  },
  {
    title: 'Elden Ring',
    genres: ['rpg', 'action'],
    releaseYear: 2022,
    completed: false,
  },
  {
    title: 'Zelda: Breath of the Wild',
    genres: ['adventure', 'action'],
    releaseYear: 2017,
    completed: true,
  },
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
        new Spotr({
          collection: 'invalid' as unknown as object[],
          fields: ['name'],
        });
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
      const spotr = new Spotr({
        collection: new Set(people),
        fields: ['firstName'],
      });
      expect(spotr.collection).toHaveLength(2);
    });

    it('throws for invalid field threshold', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: [{ name: 'firstName', threshold: 1.5 }],
        });
      }).toThrow(SpotrError);
    });

    it('throws for field not string or object', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: [123 as unknown as { name: string }],
        });
      }).toThrow(SpotrError);
    });

    it('throws for field missing name', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: [{ weight: 1 } as unknown as { name: string }],
        });
      }).toThrow(SpotrError);
    });

    it('throws for keywords missing name', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: ['firstName'],
          keywords: [
            { triggers: ['x'], handler: () => [] } as unknown as {
              name: string;
              triggers: string[];
              handler: () => object[];
            },
          ],
        });
      }).toThrow(SpotrError);
    });

    it('throws for keywords missing triggers', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: ['firstName'],
          keywords: [
            { name: 'x', handler: () => [] } as unknown as {
              name: string;
              triggers: string[];
              handler: () => object[];
            },
          ],
        });
      }).toThrow(SpotrError);
    });

    it('throws for keywords missing handler', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: ['firstName'],
          keywords: [
            { name: 'x', triggers: ['x'] } as unknown as {
              name: string;
              triggers: string[];
              handler: () => object[];
            },
          ],
        });
      }).toThrow(SpotrError);
    });

    it('throws for invalid options threshold', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: ['firstName'],
          threshold: -0.1,
        });
      }).toThrow(SpotrError);
    });

    it('throws for invalid options limit', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: ['firstName'],
          limit: 0,
        });
      }).toThrow(SpotrError);
    });

    it('throws for invalid options debounce', () => {
      expect(() => {
        new Spotr({
          collection: people,
          fields: ['firstName'],
          debounce: -1,
        });
      }).toThrow(SpotrError);
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

    it('limits results when query returns multiple matches', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title', 'genres'],
        limit: 2,
      });
      const result = spotr.query('rpg');
      expect(result.results).toHaveLength(2);
    });

    it('limit returns top results by score', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        limit: 1,
      });
      const result = spotr.query('zelda');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].item.title).toContain('Zelda');
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
        expect(result.results[i - 1].score).toBeGreaterThanOrEqual(
          result.results[i].score
        );
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
            handler: (collection) =>
              collection.filter((item) => item.completed),
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
            handler: (collection) =>
              collection.filter((item) => item.completed),
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
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) =>
                collection.filter((item) => item.releaseYear >= 2020),
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
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) =>
                collection.filter((item) => item.releaseYear >= 2020),
            },
          ],
        },
      });
      const result = spotr.query('done recent');
      expect(result.matchedKeywords).toHaveLength(2);
    });

    it('and mode: both keywords yields intersection (empty when no overlap)', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'and',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) =>
                collection.filter((item) => item.releaseYear >= 2020),
            },
          ],
        },
      });
      const result = spotr.query('done recent');
      expect(result.matchedKeywords).toHaveLength(2);
      expect(result.results).toHaveLength(0);
    });

    it('or mode: both keywords yields union of filtered results', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'or',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) =>
                collection.filter((item) => item.releaseYear >= 2020),
            },
          ],
        },
      });
      const result = spotr.query('done recent');
      expect(result.results).toHaveLength(3);
    });

    it('or mode: single keyword filters to that handler result', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'or',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
          ],
        },
      });
      const result = spotr.query('done');
      expect(result.results).toHaveLength(2);
      expect(result.results.every((r) => r.item.completed)).toBe(true);
    });

    it('and mode: single keyword filters to that handler result', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'and',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
          ],
        },
      });
      const result = spotr.query('done');
      expect(result.results).toHaveLength(2);
      expect(result.results.every((r) => r.item.completed)).toBe(true);
    });

    it('handler receives matched terms', () => {
      let receivedTerms: string[] = [];
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done', 'complete'],
            handler: (collection, matchedTerms) => {
              receivedTerms = matchedTerms;
              return collection.filter((item) => item.completed);
            },
          },
        ],
      });
      spotr.query('done complete');
      expect(receivedTerms).toEqual(['done', 'complete']);
    });

    it('multiple triggers: single trigger returns that term', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done', 'complete', 'finished'],
            handler: (collection) =>
              collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('done');
      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.matchedKeywords[0]).toEqual({
        name: 'completed',
        terms: ['done'],
      });
    });

    it('multiple triggers: different trigger returns that term', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done', 'complete', 'finished'],
            handler: (collection) =>
              collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('complete');
      expect(result.matchedKeywords[0]).toEqual({
        name: 'completed',
        terms: ['complete'],
      });
    });

    it('multiple triggers: all triggers in query return all terms', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done', 'complete', 'finished'],
            handler: (collection) =>
              collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('done complete finished');
      expect(result.matchedKeywords[0]).toEqual({
        name: 'completed',
        terms: ['done', 'complete', 'finished'],
      });
    });

    it('single string trigger (not array) works correctly', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: 'done',
            handler: (collection) =>
              collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('done');
      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.matchedKeywords[0]).toEqual({
        name: 'completed',
        terms: ['done'],
      });
      expect(result.results.every((r) => r.item.completed)).toBe(true);
    });

    it('matchedKeywords identifies which definitions were applied', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: {
          mode: 'and',
          definitions: [
            {
              name: 'completed',
              triggers: ['done'],
              handler: (collection) =>
                collection.filter((item) => item.completed),
            },
            {
              name: 'recent',
              triggers: ['recent'],
              handler: (collection) =>
                collection.filter((item) => item.releaseYear >= 2020),
            },
          ],
        },
      });
      const result = spotr.query('done');
      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.matchedKeywords[0].name).toBe('completed');
      expect(result.matchedKeywords[0].terms).toEqual(['done']);
    });

    it('matchedKeywords empty when no keywords match', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done'],
            handler: (collection) =>
              collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('witcher');
      expect(result.matchedKeywords).toHaveLength(0);
    });

    it('matchedKeywords with keyword and search term shows both', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        keywords: [
          {
            name: 'completed',
            triggers: ['done'],
            handler: (collection) =>
              collection.filter((item) => item.completed),
          },
        ],
      });
      const result = spotr.query('witcher done');
      expect(result.matchedKeywords).toHaveLength(1);
      expect(result.matchedKeywords[0].name).toBe('completed');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].item.title).toBe('The Witcher 3');
    });

    it('throws when keyword handler returns non-array (and mode)', () => {
      expect(() => {
        const spotr = new Spotr<Game>({
          collection: games,
          fields: ['title'],
          keywords: {
            mode: 'and',
            definitions: [
              {
                name: 'bad',
                triggers: ['done'],
                handler: () => 'invalid' as unknown as Game[],
              },
            ],
          },
        });
        spotr.query('done');
      }).toThrow(SpotrError);
    });

    it('throws when keyword handler returns non-array (or mode)', () => {
      expect(() => {
        const spotr = new Spotr<Game>({
          collection: games,
          fields: ['title'],
          keywords: {
            mode: 'or',
            definitions: [
              {
                name: 'bad',
                triggers: ['done'],
                handler: () => 'invalid' as unknown as Game[],
              },
            ],
          },
        });
        spotr.query('done');
      }).toThrow(SpotrError);
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

  describe('fields and fuzzy matching with threshold', () => {
    it('matches exact query within threshold', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        threshold: 0.3,
      });
      const result = spotr.query('witcher');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.title).toBe('The Witcher 3');
      expect(result.results[0].score).toBeGreaterThanOrEqual(0.9);
    });

    it('excludes matches below threshold', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        threshold: 0.5,
      });
      const result = spotr.query('xyz');
      expect(result.results).toHaveLength(0);
    });

    it('matches substring within threshold', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        threshold: 0.3,
      });
      const result = spotr.query('zel');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.title).toContain('Zelda');
    });

    it('matches typo within lenient threshold', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        threshold: 0.3,
      });
      const result = spotr.query('witche');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('rejects typo with strict threshold', () => {
      const collection = [
        { title: 'witcher', genres: [], releaseYear: 0, completed: false },
      ];
      const spotr = new Spotr<Game>({
        collection,
        fields: ['title'],
        threshold: 0.95,
      });
      const result = spotr.query('witehr');
      expect(result.results).toHaveLength(0);
    });

    it('respects field-level threshold over global', () => {
      const collection: { title: string; tag: string }[] = [
        { title: 'hello', tag: 'hello' },
      ];
      const spotr = new Spotr({ collection, fields: ['title', 'tag'] });
      const spotrStrict = new Spotr({
        collection,
        fields: [
          { name: 'title', threshold: 0.95 },
          { name: 'tag', threshold: 0.95 },
        ],
      });
      const resultLenient = spotr.query('helo');
      const resultStrict = spotrStrict.query('helo');
      expect(resultLenient.results.length).toBeGreaterThan(0);
      expect(resultStrict.results).toHaveLength(0);
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

    it('caseSensitive match when query casing matches', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        caseSensitive: true,
      });
      const result = spotr.query('Witcher');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].item.title).toBe('The Witcher 3');
    });
  });

  describe('minMatchCharLength', () => {
    it('filters short tokens but uses long ones', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        minMatchCharLength: 3,
      });
      const result = spotr.query('a ab zel');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('all tokens filtered yields empty results', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        minMatchCharLength: 3,
      });
      const result = spotr.query('ab');
      expect(result.results).toHaveLength(0);
    });

    it('minMatchCharLength 2 allows normal match', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        minMatchCharLength: 2,
      });
      const result = spotr.query('elda');
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  describe('query vs queryAsync', () => {
    it('returns same structure as query', async () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      const syncResult = spotr.query('witcher');
      const asyncResult = await spotr.queryAsync('witcher');
      expect(asyncResult.results).toEqual(syncResult.results);
      expect(asyncResult.matchedKeywords).toEqual(syncResult.matchedKeywords);
      expect(asyncResult.tokens).toEqual(syncResult.tokens);
      expect(asyncResult.warnings).toEqual(syncResult.warnings);
    });

    it('debounce 0 resolves immediately', async () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        debounce: 0,
      });
      const result = await spotr.queryAsync('witcher');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('debounce uses last query when called rapidly', async () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
        debounce: 50,
      });
      spotr.queryAsync('witcher');
      const result = await spotr.queryAsync('zelda');
      expect(result.results[0].item.title).toContain('Zelda');
    });
  });

  describe('setCollection and getCollection', () => {
    it('updates collection', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      expect(spotr.collection).toHaveLength(3);
      spotr.setCollection([games[0]]);
      expect(spotr.collection).toHaveLength(1);
    });

    it('get collection returns current collection', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      expect(spotr.collection).toHaveLength(3);
      expect(spotr.collection).toEqual(games);
    });

    it('query uses new collection after setCollection', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      spotr.setCollection([games[0]]);
      const result = spotr.query('witcher');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].item.title).toBe('The Witcher 3');
    });

    it('setCollection with Set converts to array', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      spotr.setCollection(new Set([games[0]]));
      expect(Array.isArray(spotr.collection)).toBe(true);
      expect(spotr.collection).toHaveLength(1);
      const result = spotr.query('witcher');
      expect(result.results).toHaveLength(1);
    });

    it('setCollection to empty then back restores query results', () => {
      const spotr = new Spotr<Game>({
        collection: games,
        fields: ['title'],
      });
      spotr.setCollection([]);
      const result = spotr.query('witcher');
      expect(result.results).toHaveLength(0);
      spotr.setCollection(games);
      const result2 = spotr.query('witcher');
      expect(result2.results).toHaveLength(1);
    });
  });
});
