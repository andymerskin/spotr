# Table UI Pattern — HTML Highlighting

Examples use framework-specific APIs to render highlighted cell content. All use `highlightCellValue()` from shared utils.

## Mapping

| Framework | Syntax                                                          | Element  |
| --------- | --------------------------------------------------------------- | -------- |
| React     | `dangerouslySetInnerHTML={{ __html: highlightCellValue(...) }}` | `<span>` |
| Preact    | Same as React                                                   | `<span>` |
| Vue       | `v-html="highlightCellValue(...)"`                              | `<td>`   |
| Svelte    | `{@html highlightCellValue(...)}`                               | `<td>`   |
| Solid     | `innerHTML={highlightCellValue(...)}`                           | `<span>` |

## Usage

```typescript
// highlightCellValue(value, columnKey, matchedKeywords) → string
// Returns HTML with <mark class="keyword-highlight"> around matching text
```

- **value**: Cell value (from `getNestedValue(r.item, col)`)
- **columnKey**: Column name (for special handling: `completed`, `platforms`)
- **matchedKeywords**: From `result.matchedKeywords`

## Security

These APIs render raw HTML. `highlightCellValue` only wraps matched terms in `<mark>`; it does not escape user content. Only use it with data from trusted sources. For untrusted input, escape or sanitize before passing to `highlightCellValue`, or avoid innerHTML/v-html/@html.

## Reference

- Implementation: [examples/shared/utils.ts](../../../examples/shared/utils.ts) — `highlightCellValue`
