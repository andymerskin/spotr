# Validation Strict Fail-Fast

All validation happens at construction time. No validation inside `query()`.

## Validation Location

Validation functions in `packages/spotr/src/utils/validate.ts`:

- `validateCollection()` — checks Array or Set
- `validateFields()` — validates field configs
- `validateKeywords()` — validates keyword definitions
- `validateOptions()` — orchestrates all validation

## Constructor Path

```typescript
constructor(options: SpotrOptions<T>) {
  const validated = validateOptions(options); // All validation here
  this._collection = validated.collection;
  // ... assign other validated options
}
```

## setCollection Re-Validation

`setCollection` re-validates the collection:

```typescript
setCollection(collection: T[] | Set<T>): void {
  this._collection = validateCollection(collection as unknown) as T[];
}
```

## query() Assumes Valid Config

`query()` never validates—assumes constructor validated everything:

```typescript
query(search: string): SpotrResult<T> {
  // No validation here—config is already valid
  const tokens = tokenize(search);
  // ... proceed with search logic
}
```

## Rules

- All validation in constructor path
- `setCollection` re-validates collection only
- `query()` trusts config is valid
- Validation functions throw `SpotrError` with appropriate `ErrorCodes`
