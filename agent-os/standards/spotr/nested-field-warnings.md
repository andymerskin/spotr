# Nested Field Warnings

Missing nested paths (e.g. `address.city`) add warnings to `result.warnings[]`—never throw or log.

## Implementation

```typescript
const value = getNestedValue(item, field.name);

if (value == null) {
  if (field.name.includes('.')) {
    warnings.push(`Field "${field.name}" not found on item`);
  }
  continue; // Skip field in scoring
}
```

## Behavior

- `getNestedValue` returns `undefined` for missing paths
- Only warn for dotted paths (implies intentional nested access)
- Skip field in scoring, continue with remaining fields
- Library stays functional—returns results with warnings

## Example

```typescript
const result = spotr.query('search');
// result.warnings: ['Field "address.city" not found on item']
// result.results: [...] // Still returns results
```

## Rules

- Missing nested path → `result.warnings[]`
- Only warn for paths containing `.` (nested access)
- Never throw or `console.error`
- Continue scoring other fields
- Test via `result.warnings` array
