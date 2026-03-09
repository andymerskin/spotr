# AI Agent Guidelines

> See [README.md](README.md) for project overview, API, and setup. See `package.json` (root + `packages/spotr/`) for all available scripts.
>
> **Code conventions and standards** are documented in [`agent-os/standards/`](agent-os/standards/). See [`agent-os/standards/index.yml`](agent-os/standards/index.yml) for a complete list.

## Workspace Structure

Bun monorepo: `packages/spotr` (library), `site` (Astro), `examples/*/*` (25 examples). Always run `bun install` from repo root. The `site` and all examples reference `spotr` via `workspace:*`.

## Quick Reference

- **Synced files**: See `examples/synced-files-and-imports.md`
- **Error handling**: See `spotr/error-handling-tier-model.md`
- **Code conventions**: See `typescript/code-conventions.md`, `site/tailwind-conventions.md`, `site/iconify-usage.md`
- **Testing**: See `testing/coverage-and-setup.md`
- **Pre-commit checklist**: See `global/pre-commit-checklist.md`
- **Git patterns**: See `git/commit-patterns.md`

## Permissions

**No approval needed:** Read any file, edit source/example files (following sync rules), run build/test/lint/typecheck commands locally.

**Requires approval:** `bun add`/`bun install`/`bun update`, modifying `package.json` dependencies, `bun run release`, git operations (commit/push/branch), CI/CD config changes, significant build config changes.
