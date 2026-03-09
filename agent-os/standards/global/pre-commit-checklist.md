# Pre-Commit Checklist

Run these checks before considering a task complete:

## Required Checks

1. **Typecheck**: `bun run typecheck` — fix all TS errors
2. **Lint**: `bun run lint` — fix all ESLint errors/warnings
3. **Format**: `bun run format` — apply Prettier
4. **Test Coverage**: `bun run test:coverage` — if `packages/spotr/src/` was modified; ensure 85% threshold
5. **Update README.md** — if library API changed (new options, methods, behavior) or framework usage changed
6. **Review Site Landing Page** — if library functionality changed (`site/src/pages/index.astro` and landing demo components); update CodeMirror examples in `site/src/components/HeaderCodeExample.tsx` if framework API/usage changed
7. **Review Examples** — if library API changed or framework API/usage changed (`examples/{react|vue|svelte|solid|preact}/` and run `bun run examples:typecheck`)

## Faster Iteration

Use file-scoped commands for faster iteration:

```bash
eslint path/to/file.ts
tsc --noEmit path/to/file.ts
vitest run path/to/file.test.ts
```
