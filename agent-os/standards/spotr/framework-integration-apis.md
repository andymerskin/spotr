# Framework Integration APIs

Each framework integration has a different API pattern matching framework conventions.

## React

```typescript
import { useSpotr } from 'spotr/react';

const spotr = useSpotr({
  collection: games,
  fields: [{ name: 'title', weight: 1 }],
});
// Returns: Spotr<T> directly
```

- Returns `Spotr<T>` instance directly
- Uses `useRef` + `shallowEqual` for option stability
- Options are plain objects

## Vue

```typescript
import { useSpotr } from 'spotr/vue';

const spotr = useSpotr(() => ({
  collection: games.value,
  fields: [{ name: 'title', weight: 1 }],
}));
// Returns: ShallowRef<Spotr<T> | null>
```

- Returns `ShallowRef<Spotr<T> | null>`
- Options can be `MaybeRefOrGetter<SpotrOptions<T>>`
- Uses `toValue()` to unwrap refs/getters
- Uses `watch` with `{ immediate: true, deep: true }` to react to option changes

## Solid

```typescript
import { createSpotr } from 'spotr/solid';

const spotr = createSpotr({
  collection: games,
  fields: [{ name: 'title', weight: 1 }],
});
// Returns: () => Spotr<T> (getter function)
```

- Returns `() => Spotr<T>` (getter function)
- Options can be static or `() => SpotrOptions<T>`
- Uses `createMemo` internally
- Call `spotr().query(query())` in a memo for reactive results

## Svelte

```typescript
import { createSpotr } from 'spotr/svelte';

const spotr = createSpotr({
  collection: games,
  fields: [{ name: 'title', weight: 1 }],
});
// Returns: Readable<Spotr<T>> (Svelte store)
```

- Returns `Readable<Spotr<T>>` — a Svelte store; use `$spotr` to access the instance
- Options can be plain object or `Readable<SpotrOptions<T>>` for reactive config
- Use with `derived([spotr, query], ([$spotr, $query]) => $spotr.query($query))` for reactive results

## Preact

```typescript
import { useSpotr } from 'spotr/preact';

const spotr = useSpotr({
  collection: games,
  fields: [{ name: 'title', weight: 1 }],
});
// Returns: Spotr<T> directly
```

- Same API as React (returns `Spotr<T>` directly)

## Common Pattern

All integrations:

- Re-export `Spotr` class and key types
- Provide framework-specific hook/composable/store creator
- Match framework conventions (refs, getters, stores)
