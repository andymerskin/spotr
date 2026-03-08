# Keyword Handler Runtime Errors

Keyword handlers must return `T[]`. Bad returns log and skip—never throw.

## Handler Return Check

```typescript
const handlerResult = handler(result, terms);

if (!Array.isArray(handlerResult)) {
  console.error(
    `[Spotr] Keyword handler "${def.name}" must return an array, received ${typeof handlerResult}. Skipping this filter.`
  );
  continue; // Skip this keyword, continue with remaining logic
}
```

## Behavior

- Log error with `[Spotr]` prefix
- Skip that keyword filter
- Continue with remaining keywords/search logic
- Library stays functional—returns results

## Both Modes

Applies to both `mode: 'and'` and `mode: 'or'`:

```typescript
// 'and' mode: skip keyword, keep current collection
if (!Array.isArray(handlerResult)) {
  console.error(...);
  continue; // Keep current collection for this step
}

// 'or' mode: skip keyword, don't add its results
if (!Array.isArray(keywordResults)) {
  console.error(...);
  continue; // Don't add this keyword's results
}
```

## Testing

Test via `console.error` spy:

```typescript
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

const result = spotr.query('keyword');

expect(consoleErrorSpy).toHaveBeenCalledWith(
  expect.stringContaining('[Spotr] Keyword handler "bad" must return an array')
);
expect(result.results).toBeDefined(); // Results still returned
```

## Rules

- Never throw inside `_applyKeywords()`
- Always log with `[Spotr]` prefix
- Always skip the bad keyword, continue with rest
- Test that results are still returned despite error
