# AI Agent Guidelines

> See [README.md](README.md) for project overview, API, and setup. See `package.json` (root + `packages/spotr/`) for all available scripts.

## Workspace Structure

Bun monorepo: `packages/spotr` (library), `site` (Astro), `examples/*/*` (25 examples). Always run `bun install` from repo root. The `site` and all examples reference `spotr` via `workspace:*`.

## Synced Files (Critical)

Several files in example directories are **auto-overwritten** by `bun run examples:sync`. Never edit them directly.

**NEVER edit in individual example dirs:**

- `examples/{framework}/{example}/src/data/*.json`
- `examples/{framework}/{example}/src/types.ts`
- `examples/{framework}/{example}/src/utils.ts`
- `examples/{framework}/{example}/src/styles.css`

**Always edit shared sources, then sync:**

1. Edit `examples/shared/{people.json,games.json,types.ts,utils.ts,styles.css}`
2. Run `bun run examples:sync`
3. Commit both shared and synced files together

**Safe to edit directly:** `App.tsx` (or `.vue`, `.svelte`), `main.tsx`, `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` inside each example.

See `scripts/sync-examples.ts` for exact file mappings.

## Error Handling (3-Tier Model)

1. **Config/setup errors → THROW** (`SpotrError`): constructor, `setCollection`, validation. Fail fast so devs fix misconfiguration.
2. **Runtime user-code errors → LOG & RECOVER** (`console.error` + safe fallback): keyword handler exceptions, wrong return types during `query()`. Never throw—would crash the consumer page.
3. **Non-fatal issues → WARNINGS** (`result.warnings[]` or `console.warn`): truncation, missing nested paths. Library stays functional.

Rules:

- DO validate all public API methods consistently with constructor validation.
- DO NOT throw inside `query()` / `_applyKeywords()` for user-provided code errors.
- DO provide clear, actionable error messages referencing `ErrorCodes`.
- Test config errors with `SpotrError`, runtime errors with `vi.spyOn(console, 'error')`, warnings via `result.warnings`.

## Code Conventions

### TypeScript

- Strict mode, ES2022, ESM (`type: "module"`).
- Naming: classes `PascalCase`, functions `camelCase`, types `PascalCase`, constants `UPPER_SNAKE_CASE`, private props `_prefix`.
- Prefer `@types/*` packages over custom `.d.ts` files for external libs. Install as `devDependencies`, reference in `tsconfig.json` `types` array.
- Prefer named exports. Use `import type` for type-only imports.

### Site / Tailwind

- Add `cursor-pointer` to all `<button>` elements and `<a>` tags without `href`.
- Prefer `mt-*` or `space-y-*` for vertical spacing; avoid `mb-*`.

### Icons (Iconify only)

- Logos: `@iconify-json/logos` → `logos:react`, `logos:vue`, `logos:svelte`, `logos:solidjs`, `logos:preact`, `logos:github`, etc.
- All other icons: `@iconify-json/solar` → `solar:magnifer-linear`, `solar:close-circle-linear`, etc.
- Astro: `import { Icon } from 'astro-icon/components'` → `<Icon name="logos:react" />`
- React: `import { Icon } from '@iconify/react'` → `<Icon icon="solar:magnifer-linear" />`
- **Never** paste inline SVGs or import `.svg` files for icons.

### Import Paths in Examples

- Use `'spotr'` for core imports, `'spotr/react'`, `'spotr/vue'`, etc. for integrations. Never use relative paths like `../../src/`.

## Testing

- Vitest with globals enabled. Test files: `packages/spotr/test/*.test.ts`.
- **85% minimum coverage** (lines, functions, branches, statements) enforced for `packages/spotr/src/`.
- Run `bun run test:coverage` after any change to `packages/spotr/src/`.
- Add tests for new features, update tests for changed behavior, add regression tests for bugs.
- Remove obsolete tests when removing functionality; don't let coverage drop below 85%.

## Before Finishing Changes

Run these checks before considering a task complete:

1. `bun run typecheck` — fix all TS errors
2. `bun run lint` — fix all ESLint errors/warnings
3. `bun run format` — apply Prettier
4. `bun run test:coverage` — if `packages/spotr/src/` was modified; ensure 85% threshold
5. Update `README.md` — if library API changed (new options, methods, behavior)
6. Review `site/src/pages/index.astro` and landing demo components — if library functionality changed
7. Review `examples/{react|vue|svelte|solid|preact}/` and run `bun run examples:typecheck` — if library API changed

Use file-scoped commands for faster iteration: `eslint path/to/file.ts`, `tsc --noEmit path/to/file.ts`, `vitest run path/to/file.test.ts`.

## Permissions

**No approval needed:** Read any file, edit source/example files (following sync rules), run build/test/lint/typecheck commands locally.

**Requires approval:** `bun add`/`bun install`/`bun update`, modifying `package.json` dependencies, `bun run release`, git operations (commit/push/branch), CI/CD config changes, significant build config changes.

## Git & Pitfalls

- Commit shared + synced files together after `examples:sync`.
- Never commit `dist/` or `node_modules/`.
- `bun run release` requires approval—do not run without explicit permission.
- npm workspace bug workaround is handled automatically by `scripts/release.ts`.
- React: ensure stable option references (shallow equality comparison).
- Vue: use `toValue()` to unwrap refs/getters in `useSpotr`.
- TypeScript: ensure all types are exported from `packages/spotr/src/index.ts` for framework packages.
