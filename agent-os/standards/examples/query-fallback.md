# Empty Query Fallback (Examples)

When the search input is empty, examples show all items in the collection instead of an empty table (browse mode).

## Rule

When `!query.trim()`, return a fallback object that matches the `SpotrResult` shape so the table component can render without branching:

```typescript
{
  results: (Array.isArray(collection)
    ? [...collection]
    : Array.from(collection)
  ).map((item) => ({ item, score: null })),
  matchedKeywords: [],
  tokens: [] as string[],
  warnings: [] as string[],
}
```

- Use `[...collection]` for arrays, `Array.from(collection)` for `Set`
- Use `score: null` so the UI can display `-` or similar for unscored rows
- Keep `matchedKeywords`, `tokens`, `warnings` as empty arrays

## Why

- **Consistent shape**: Same structure as `spotr.query(query)` — no conditional rendering
- **Browse mode**: Shows the full dataset before the user types, instead of an empty state
