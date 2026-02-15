<img src="./examples/shared/spotr.svg" alt="Spotr logo" width="160" />

# Spotr

A powerful and minimal client-side fuzzy search library with zero dependencies.

## Features

- **Zero Dependencies** - Custom Levenshtein implementation, no external deps
- **Fuzzy Matching** - Configurable threshold (0-1) for fuzzy string matching
- **Nested Field Support** - Dot notation for deeply nested object properties
- **Keywords** - Add custom filtering logic for exact keyword matches
- **Framework Integrations** - React, Vue, Svelte, Solid, and Preact support
- **TypeScript** - Full type definitions included

## Installation

```sh
npm install spotr
```

## Basic Usage

```typescript
import { Spotr } from 'spotr';

type Game = {
  title: string;
  genres: string[];
  releaseYear: number;
  completed: boolean;
};

const games = new Spotr<Game>({
  collection: gamesArray,
  threshold: 0.3,
  fields: [
    { name: 'title', weight: 1 },
    { name: 'releaseYear', weight: 0.8 },
  ],
  limit: 20,
});

const { results, matchedKeywords, tokens, warnings } = games.query('witcher');
// results: Array<{ item: Game, score: number }>
```

## Options

### `collection` (required)

Array or Set of objects to search.

```typescript
collection: gamesArray // or new Set(gamesArray)
```

### `fields` (required)

Properties to search against with weight configuration. Supports dot notation for nested objects.

```typescript
fields: [
  'title',                              // string shorthand, weight: 1
  { name: 'title', weight: 1 },         // full config
  { name: 'email', weight: 0.7 },       // lower priority
  { name: 'address.city', weight: 0.8 }, // nested field
]
```

### `keywords` (optional)

Keywords that trigger specific collection filtering before fuzzy matching.

```typescript
keywords: {
  mode: 'and',
  definitions: [
    {
      name: 'completed',
      triggers: ['done', 'complete', 'finished'],
      handler: (collection) => collection.filter(item => item.completed),
    },
    {
      name: 'platform',
      triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'],
      handler: (collection, matchedTerms) =>
        collection.filter(item =>
          matchedTerms.some(term => 
            item.platforms.some(p => p.toLowerCase().includes(term))
          )
        ),
    },
  ],
}
```

### `threshold` (optional)

Global fuzzy matching threshold. Default: `0.3`

- `0` = match anything (no filtering)
- `0.3` = recommended default
- `1` = exact match required

### `limit` (optional)

Maximum number of results to return. Default: `Infinity`

### `caseSensitive` (optional)

Enable case-sensitive matching. Default: `false`

### `minMatchCharLength` (optional)

Minimum query length to trigger matching. Default: `1`

## Result Type

```typescript
interface SpotrResult<T> {
  results: ScoredResult<T>[];  // Array of { item, score }
  matchedKeywords: MatchedKeyword[];  // Keywords that matched
  tokens: string[];  // Non-keyword search terms
  warnings: string[];  // Warnings (e.g., missing nested paths)
}
```

## React Hook

```typescript
import { useSpotr } from 'spotr/react';

function GameSearch({ games, searchQuery }) {
  const spotr = useSpotr({
    collection: games,
    fields: [{ name: 'title', weight: 1 }],
  });
  
  const { results } = useMemo(
    () => spotr.query(searchQuery),
    [spotr, searchQuery]
  );
  
  return <ResultsTable results={results} />;
}
```

## Vue Composable

```typescript
import { useSpotr } from 'spotr/vue';

const games = ref<Game[]>([]);
const query = ref('');

const spotr = useSpotr(() => ({
  collection: games.value,
  fields: [{ name: 'title', weight: 1 }],
}));

const results = computed(() => spotr.value?.query(query.value));
```

## Svelte Store

```typescript
import { createSpotr } from 'spotr/svelte';

const { spotr, query, results } = createSpotr({
  collection: games,
  fields: [{ name: 'title', weight: 1 }],
});

// query is a writable store, results is a derived store
// Use $query and $results in your Svelte template
```

## Solid Hook

```typescript
import { createSpotr } from 'spotr/solid';

const { query, setQuery, results } = createSpotr({
  collection: games,
  fields: [{ name: 'title', weight: 1 }],
});

// query() is a signal getter, setQuery is a signal setter, results() is a memo
```

## Preact Hook

```typescript
import { useSpotr } from 'spotr/preact';

function GameSearch({ games, searchQuery }) {
  const spotr = useSpotr({
    collection: games,
    fields: [{ name: 'title', weight: 1 }],
  });
  
  const { results } = useMemo(
    () => spotr.query(searchQuery),
    [spotr, searchQuery]
  );
  
  return <ResultsTable results={results} />;
}
```

## API Methods

### `query(search: string): SpotrResult<T>`

Search the collection with a string query.

### `queryAsync(search: string): Promise<SpotrResult<T>>`

Async search with optional debouncing.

### `setCollection(collection: T[] | Set<T>): void`

Update the collection.

### `collection: T[]` (getter)

Access the current collection.

## Development

This project uses [Bun](https://bun.sh) as the package manager. After cloning the repository, install dependencies with:

```sh
bun install
```

### Core Scripts

- `bun run build` - Build the library (outputs to `dist/`)
- `bun run test` - Run all tests once
- `bun run test:watch` - Run tests in watch mode
- `bun run typecheck` - Type check the library (`tsc --noEmit`)
- `bun run lint` - Lint the codebase (ESLint)

### Example Scripts

- `bun run examples:typecheck` - Type check all example applications
- `bun run examples:sync` - Sync shared files from `examples/shared/` to all examples
- `bun run examples:install` - Install dependencies for all examples
- `bun run examples:update` - Update dependencies for all examples

### Setup Scripts

- `bun run prepare` - Setup Husky git hooks (runs automatically on install)

## License

MIT
