# Example Project Structure

Examples follow a consistent structure for local dev, StackBlitz, and monorepo workflows.

## Naming

- `package.json` name: `spotr-{framework}-{example}`
- Frameworks: `react`, `vue`, `svelte`, `solid`, `preact`
- Example types: `fields-basic`, `fields-nested`, `keywords-basic`, `keywords-advanced`, `advanced-combined`

## package.json

```json
{
  "name": "spotr-{framework}-{example}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "packageManager": "npm@latest",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "{framework-specific}",
    "format": "prettier --write ."
  },
  "dependencies": {
    "spotr": "^x.x.x"
  },
  "devDependencies": {
    "prettier": "^3.8.1",
    "typescript": "^5.9.3",
    "vite": "^6.1.0"
  },
  "overrides": {
    "rollup": "4.59.0"
  }
}
```

- **packageManager**: Always `npm@latest` — StackBlitz uses npm
- **spotr**: Publish from npm (e.g. `^1.0.0-alpha.4`), never `workspace:*` or `file:` — StackBlitz can't use monorepo workspaces
- **overrides.rollup**: Pin for Vite compatibility
- **typecheck**: `tsc --noEmit` (React/Preact/Solid), `vue-tsc --noEmit` (Vue), `tsc --noEmit` (Svelte)

## Lock files

- Commit both `package-lock.json` and `bun.lock`
- Do not ignore `examples/**/package-lock.json` in `.gitignore`
- After modifying examples: run `bun run examples:install`, then commit both lock files
- When publishing a new spotr version: `bun run examples:update`, then `bun run examples:install`

## .stackblitzrc

```json
{
  "installDependencies": true,
  "startCommand": "npm run dev"
}
```

## index.html & mount

| Framework            | Mount ID | index.html              |
| -------------------- | -------- | ----------------------- |
| React, Preact, Solid | `#root`  | `<div id="root"></div>` |
| Vue, Svelte          | `#app`   | `<div id="app"></div>`  |

## Vite config

Per-framework plugin: `@vitejs/plugin-react`, `@vitejs/plugin-vue`, `vite-plugin-solid`, `@sveltejs/vite-plugin-svelte`, `@preact/preset-vite` (or equivalent).

## Directory layout

```
examples/{framework}/{example}/
├── package.json
├── package-lock.json
├── .stackblitzrc
├── index.html
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx (or main.ts)
    ├── App.tsx (or .vue, .svelte)
    ├── data/     # synced from examples/shared/
    ├── types.ts  # synced
    ├── utils.ts  # synced
    └── styles.css # synced
```
