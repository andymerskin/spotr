# Synced Files & Import Paths

## Synced Files (Shared Sources)

Several files in example directories are **auto-overwritten** by `bun run examples:sync`. Never edit them directly.

- **Never edit** in individual examples: `src/data/*.json`, `types.ts`, `utils.ts`, `styles.css`
- **Always edit** shared sources in `examples/shared/`, then run `bun run examples:sync`
- **Commit** shared changes and synced outputs together

File mappings: [scripts/sync-examples.ts](../../../scripts/sync-examples.ts)

## Import Paths

Always use package imports for spotr. Never use relative paths to library source.

- **Core**: `'spotr'` — Spotr class, types, utilities
- **Integrations**: `'spotr/react'`, `'spotr/vue'`, `'spotr/solid'`, `'spotr/svelte'`, `'spotr/preact'`

### Why

- **Workspace resolution**: Examples use `workspace:*`; package imports resolve correctly in the monorepo
- **StackBlitz / external tooling**: Relative paths like `../../src/` break when examples run standalone
- **Consistency**: Matches how consumers install and import the published package
