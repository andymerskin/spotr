# Error Handling 3-Tier Model

Use three distinct error handling strategies based on error type:

## Tier 1: Config/Setup Errors → THROW

Constructor, `setCollection`, and validation functions throw `SpotrError`:

```typescript
throw new SpotrError(
  `collection must be an Array or Set, received ${typeof collection}`,
  ErrorCodes.INVALID_COLLECTION
);
```

Fail fast so developers fix misconfiguration immediately.

## Tier 2: Runtime User-Code Errors → LOG & RECOVER

Inside `query()` / `_applyKeywords()`, user-provided code errors log and skip:

```typescript
if (!Array.isArray(handlerResult)) {
  console.error(
    `[Spotr] Keyword handler "${def.name}" must return an array, received ${typeof handlerResult}. Skipping this filter.`
  );
  continue; // Skip this keyword, continue with remaining logic
}
```

Never throw—would crash the consumer page. Library stays functional.

## Tier 3: Non-Fatal Issues → WARNINGS

Truncation, missing nested paths → `result.warnings[]`:

```typescript
if (stringValue.length > maxStringLength) {
  warnings.push(
    `Target string truncated from ${stringValue.length} to ${maxStringLength} characters for performance`
  );
}
```

Return warnings in result; library continues normally.

## Rules

- DO validate all public API methods consistently with constructor validation
- DO NOT throw inside `query()` / `_applyKeywords()` for user-provided code errors
- DO provide clear, actionable error messages referencing `ErrorCodes`
- Test config errors with `SpotrError`, runtime errors with `vi.spyOn(console, 'error')`, warnings via `result.warnings`
