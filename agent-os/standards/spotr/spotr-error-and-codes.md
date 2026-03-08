# SpotrError and ErrorCodes

All thrown errors use `SpotrError` with `ErrorCodes` constants.

## Error Class

```typescript
export class SpotrError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SpotrError';
  }
}
```

## Error Codes

Define codes in `packages/spotr/src/errors.ts`:

```typescript
export const ErrorCodes = {
  INVALID_COLLECTION: 'INVALID_COLLECTION',
  INVALID_FIELD_CONFIG: 'INVALID_FIELD_CONFIG',
  INVALID_FIELD_WEIGHT: 'INVALID_FIELD_WEIGHT',
  INVALID_KEYWORD: 'INVALID_KEYWORD',
  INVALID_HANDLER_RETURN: 'INVALID_HANDLER_RETURN',
  INVALID_MAX_STRING_LENGTH: 'INVALID_MAX_STRING_LENGTH',
} as const;
```

## Error Message Format

Describe what was received and what's expected:

```typescript
throw new SpotrError(
  `collection must be an Array or Set, received ${typeof collection}`,
  ErrorCodes.INVALID_COLLECTION
);

throw new SpotrError(
  `fields[${index}].name is required and must be a string`,
  ErrorCodes.INVALID_FIELD_CONFIG
);
```

## Testing

Assert both instance and code:

```typescript
expect(e).toBeInstanceOf(SpotrError);
expect((e as SpotrError).code).toBe(ErrorCodes.INVALID_COLLECTION);
```

## Adding New Codes

1. Add constant to `ErrorCodes` object
2. Use in validation function
3. Add test case asserting the code
