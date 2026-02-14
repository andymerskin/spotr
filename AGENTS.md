# AI Agent Guidelines

This document provides guidelines for AI agents working on this codebase, specifically regarding files that are automatically synced from `examples/shared/` to individual example directories.

## Important: Synced Files

Several files are automatically synced from `examples/shared/` to all example directories via the `scripts/sync-examples.ts` script. These files are overwritten when the sync script runs, so they should **NEVER** be edited directly in individual example directories.

## Files Synced by scripts/sync-examples.ts

The sync script copies the following files from `examples/shared/` to each example:

1. **Data files** (`people.json`, `games.json`) → `examples/{framework}/{example}/src/data/`
2. **types.ts** → `examples/{framework}/{example}/src/types.ts`
3. **utils.ts** → `examples/{framework}/{example}/src/utils.ts` (with import adaptation)
4. **styles.css** → `examples/{framework}/{example}/src/styles.css`

## ⚠️ Files That Should NOT Be Edited

**Agents must NEVER edit these files in individual example directories:**

- `examples/{react|vue|svelte|solid|preact}/{example}/src/data/*.json`
- `examples/{react|vue|svelte|solid|preact}/{example}/src/types.ts`
- `examples/{react|vue|svelte|solid|preact}/{example}/src/utils.ts`
- `examples/{react|vue|svelte|solid|preact}/{example}/src/styles.css`

These files are automatically overwritten when `bun run sync-examples` is executed. Any changes made directly to these files will be lost.

## ✅ Files That SHOULD Be Edited

**Agents should ONLY edit these files in the shared directory:**

- `examples/shared/people.json`
- `examples/shared/games.json`
- `examples/shared/types.ts`
- `examples/shared/utils.ts`
- `examples/shared/styles.css`

After editing shared files, run `bun run sync-examples` to propagate changes to all examples.

## Example-Specific Files That Can Be Edited

These files are unique to each example and can be edited directly:

- `examples/{framework}/{example}/src/App.tsx` (or `.vue`, `.svelte`)
- `examples/{framework}/{example}/src/main.tsx` (or `.ts`)
- `examples/{framework}/{example}/package.json`
- `examples/{framework}/{example}/vite.config.ts`
- `examples/{framework}/{example}/tsconfig.json`
- `examples/{framework}/{example}/index.html`

## Workflow

### When modifying shared code/types/styles/data:

1. Edit files in `examples/shared/`
2. Run `bun run sync-examples` to propagate changes to all examples
3. Commit both the shared file changes and the synced files

### When modifying example-specific code:

1. Edit files directly in the example directory
2. No sync step needed

## File Structure

```
examples/
├── shared/                    # ✅ EDIT THESE FILES
│   ├── people.json
│   ├── games.json
│   ├── types.ts
│   ├── utils.ts
│   └── styles.css
├── react/
│   └── fields-basic/
│       └── src/
│           ├── data/          # ⚠️ DO NOT EDIT (synced)
│           │   └── people.json
│           ├── types.ts       # ⚠️ DO NOT EDIT (synced)
│           ├── utils.ts       # ⚠️ DO NOT EDIT (synced)
│           ├── styles.css     # ⚠️ DO NOT EDIT (synced)
│           ├── App.tsx        # ✅ CAN EDIT (example-specific)
│           └── main.tsx       # ✅ CAN EDIT (example-specific)
└── ...
```

## Examples

### ✅ Correct: Editing Shared Files

**Task:** Update the Person type to include a new field.

1. Edit `examples/shared/types.ts`
2. Run `bun run sync-examples`
3. All examples now have the updated type

### ❌ Incorrect: Editing Synced Files Directly

**Task:** Update the Person type to include a new field.

1. ~~Edit `examples/react/fields-basic/src/types.ts`~~ ❌
2. Changes will be lost when sync script runs

### ✅ Correct: Editing Example-Specific Files

**Task:** Add a new button to the React fields-basic example.

1. Edit `examples/react/fields-basic/src/App.tsx`
2. No sync step needed

## Summary

- **Shared files** (`examples/shared/*`) → Edit here, then sync
- **Synced files** (`examples/{framework}/{example}/src/{data|types|utils|styles}.*`) → Never edit directly
- **Example-specific files** (`examples/{framework}/{example}/src/{App|main}.*`) → Edit directly

When in doubt, check `scripts/sync-examples.ts` to see which files are synced.
