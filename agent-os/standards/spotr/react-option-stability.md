# React Option Stability

Use `shallowEqual` to compare options before recreating Spotr instance.

## Implementation

```typescript
export function useSpotr<T extends object>(options: SpotrOptions<T>): Spotr<T> {
  const optionsRef = useRef(options);

  if (!shallowEqual(optionsRef.current, options)) {
    optionsRef.current = options;
  }

  const spotrRef = useRef<Spotr<T> | null>(null);

  if (!spotrRef.current || spotrRef.current.options !== optionsRef.current) {
    spotrRef.current = new Spotr(optionsRef.current);
  }

  return spotrRef.current;
}
```

## Why

Prevents unnecessary Spotr recreation when parent component passes inline objects:

```typescript
// Without shallowEqual: recreates Spotr every render
function Parent() {
  return <Child options={{ collection: games, fields: ['title'] }} />;
}

// With shallowEqual: only recreates when options actually change
```

## shallowEqual Implementation

```typescript
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (
      (a as Record<string, unknown>)[key] !==
      (b as Record<string, unknown>)[key]
    ) {
      return false;
    }
  }
  return true;
}
```

## Rules

- Compare options with `shallowEqual` before updating ref
- Only create new Spotr when options actually change
- Ensures stable Spotr reference across renders when options are referentially equal
