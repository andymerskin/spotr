# AI Agent Guidelines

This document provides comprehensive guidelines for AI agents working on the Spotr codebase.

## Project Overview & Tech Stack

**Spotr** is a powerful and minimal client-side fuzzy search library with zero dependencies.

### Core Technologies

- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: Bun (v1.1.38)
- **Build Tool**: Vite (v6.4.1) with `preserveModules` for tree-shaking
- **Testing**: Vitest (v3.2.4) with globals enabled
- **Linting**: ESLint with TypeScript ESLint
- **Module System**: ES Modules (`type: "module"`)

### Framework Integrations

The library provides framework-specific integrations for:

- React (hooks: `useSpotr`)
- Vue (composables: `useSpotr`)
- Svelte (`useSpotr` store)
- Solid (`useSpotr` hook)
- Preact (`useSpotr` hook)

### Build Output

- Dual format: ESM (`.js`) and CommonJS (`.cjs`)
- TypeScript declarations (`.d.ts`)
- Source maps enabled
- Preserves module structure for optimal tree-shaking

## Development Environment

### Prerequisites

- Bun v1.1.38 (specified in `packageManager` field)
- Node.js (for running examples with npm)

### Initial Setup

```bash
# Install dependencies (must be run from repo root)
bun install

# Install example dependencies
bun run examples:install

# Sync shared files to examples
bun run examples:sync
```

### Workspace Setup

This repository uses **Bun workspaces** to manage the monorepo structure:

- **Root** (`/`) is the workspace host with `"workspaces": ["packages/spotr", "site"]`
- **packages/spotr** (`/packages/spotr`) is the `spotr` library package (publishable)
- **site** (`/site`) is a workspace member that depends on `spotr` via `"spotr": "workspace:*"`

**Important:** Always run `bun install` from the **repository root**. Bun will automatically:

- Install dependencies for all workspaces
- Link the local `spotr` package into `site/node_modules/spotr` (as a symlink)
- Manage a single `bun.lock` file at the root

The `site` package depends on `spotr` using the workspace protocol (`workspace:*`), which resolves to the local `packages/spotr` package. No manual symlinking scripts or `file:..` dependencies are needed.

**Running workspace commands:**

- `bun run build` - Builds the spotr library (delegates to `packages/spotr`)
- `bun run --filter spotr <command>` - Run a command in the spotr workspace
- `bun run --filter site <command>` - Run a command in the site workspace

## Commands & Scripts

### Core Library Commands

- `bun run build` - Build the library (outputs to `dist/`)
- `bun run test` - Run all tests once
- `bun run test:watch` - Run tests in watch mode
- `bun run typecheck` - Type check main library (`tsc --noEmit`)
- `bun run lint` - Lint codebase (ESLint)
- `bun run format` - Format codebase (Prettier, whole repo from root)

### Example Commands

- `bun run examples:typecheck` - Type check all examples
- `bun run examples:sync` - Sync shared files to examples (`scripts/sync-examples.ts`)
- `bun run examples:install` - Install example dependencies (`scripts/install-examples.ts`)
- `bun run examples:update` - Update example dependencies (`scripts/update-examples.ts`)

### Utility Commands

- `bun run prepare` - Husky setup (runs automatically on install)

### File-Scoped Commands

For faster feedback loops, use these single-file commands:

- **Type checking**: `tsc --noEmit path/to/file.ts` or `bun run typecheck -- --noEmit path/to/file.ts`
- **Linting**: `eslint path/to/file.ts` or `bun run lint -- path/to/file.ts`
- **Testing**: `vitest run path/to/file.test.ts` or `bun run test path/to/file.test.ts`

## Project Structure

```
spotr/
├── packages/
│   └── spotr/                   # Core library package (workspace member)
│       ├── src/                  # Core library source
│       │   ├── index.ts          # Main exports
│       │   ├── Spotr.ts          # Core Spotr class
│       │   ├── types.ts          # TypeScript type definitions
│       │   ├── errors.ts         # Error classes and codes
│       │   ├── fuzzy/            # Fuzzy matching algorithms
│       │   │   ├── index.ts
│       │   │   ├── levenshtein.ts # Levenshtein distance calculation
│       │   │   └── scorer.ts     # Item scoring logic
│       │   ├── utils/            # Utility functions
│       │   │   ├── index.ts
│       │   │   ├── tokenize.ts   # Query tokenization
│       │   │   ├── nested.ts     # Nested field access utilities
│       │   │   └── validate.ts   # Option validation
│       │   ├── react/            # React integration
│       │   │   └── index.ts      # useSpotr hook
│       │   ├── vue/              # Vue integration
│       │   │   └── index.ts      # useSpotr composable
│       │   ├── svelte/           # Svelte integration
│       │   │   └── index.ts      # useSpotr store
│       │   ├── solid/            # Solid integration
│       │   │   └── index.ts      # useSpotr hook
│       │   └── preact/           # Preact integration
│       │       └── index.ts      # useSpotr hook
│       ├── test/                 # Test files
│       │   ├── Spotr.test.ts
│       │   ├── fuzzy.test.ts
│       │   └── nested.test.ts
│       ├── dist/                 # Build output (generated)
│       ├── vite.config.ts        # Vite configuration
│       ├── vitest.config.ts      # Vitest configuration
│       ├── tsconfig.json         # TypeScript configuration
│       └── package.json          # Library package.json
├── examples/                     # Example applications
│   ├── shared/                   # Shared resources (see Synced Files section)
│   │   ├── people.json
│   │   ├── games.json
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── styles.css
│   ├── react/                    # React examples
│   │   ├── fields-basic/
│   │   ├── fields-nested/
│   │   ├── keywords-basic/
│   │   ├── keywords-advanced/
│   │   └── advanced-combined/
│   ├── vue/                      # Vue examples (same structure)
│   ├── svelte/                   # Svelte examples (same structure)
│   ├── solid/                    # Solid examples (same structure)
│   └── preact/                   # Preact examples (same structure)
├── scripts/                      # Build and utility scripts
│   ├── sync-examples.ts
│   ├── typecheck-examples.ts
│   ├── install-examples.ts
│   └── update-examples.ts
├── site/                         # Examples site (workspace member)
│   ├── src/
│   ├── package.json              # Depends on "spotr": "workspace:*"
│   └── ...
├── eslint.config.js              # ESLint configuration (root)
└── package.json                  # Root workspace config with "workspaces": ["packages/spotr", "site"]
```

## Important: Synced Files

Several files are automatically synced from `examples/shared/` to all example directories via the `scripts/sync-examples.ts` script. These files are overwritten when the sync script runs, so they should **NEVER** be edited directly in individual example directories.

### Files Synced by scripts/sync-examples.ts

The sync script copies the following files from `examples/shared/` to each example:

1. **Data files** (`people.json`, `games.json`) → `examples/{framework}/{example}/src/data/`
2. **types.ts** → `examples/{framework}/{example}/src/types.ts`
3. **utils.ts** → `examples/{framework}/{example}/src/utils.ts` (with import adaptation)
4. **styles.css** → `examples/{framework}/{example}/src/styles.css`

### ⚠️ Files That Should NOT Be Edited

**Agents must NEVER edit these files in individual example directories:**

- `examples/{react|vue|svelte|solid|preact}/{example}/src/data/*.json`
- `examples/{react|vue|svelte|solid|preact}/{example}/src/types.ts`
- `examples/{react|vue|svelte|solid|preact}/{example}/src/utils.ts`
- `examples/{react|vue|svelte|solid|preact}/{example}/src/styles.css`

These files are automatically overwritten when `bun run examples:sync` is executed. Any changes made directly to these files will be lost.

### ✅ Files That SHOULD Be Edited

**Agents should ONLY edit these files in the shared directory:**

- `examples/shared/people.json`
- `examples/shared/games.json`
- `examples/shared/types.ts`
- `examples/shared/utils.ts`
- `examples/shared/styles.css`

After editing shared files, run `bun run examples:sync` to propagate changes to all examples.

### Example-Specific Files That Can Be Edited

These files are unique to each example and can be edited directly:

- `examples/{framework}/{example}/src/App.tsx` (or `.vue`, `.svelte`)
- `examples/{framework}/{example}/src/main.tsx` (or `.ts`)
- `examples/{framework}/{example}/package.json`
- `examples/{framework}/{example}/vite.config.ts`
- `examples/{framework}/{example}/tsconfig.json`
- `examples/{framework}/{example}/index.html`

### Workflow

#### When modifying shared code/types/styles/data:

1. Edit files in `examples/shared/`
2. Run `bun run examples:sync` to propagate changes to all examples
3. Commit both the shared file changes and the synced files

#### When modifying example-specific code:

1. Edit files directly in the example directory
2. No sync step needed

### File Structure

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

## Code Style & Conventions

### Cursor & Interactive Elements (Site/Tailwind)

- **Always add `cursor-pointer`** to all `<button>` elements and any links (`<a>`) without an `href`
- Links with an `href` already get `cursor: pointer` from browsers; links styled as buttons or without href need explicit `cursor-pointer`
- Use Tailwind: `cursor-pointer` on interactive elements that look clickable

### Spacing (Site/Tailwind)

- **Avoid bottom margins** (`mb-*`) for vertical spacing
- **Prefer top margins** (`mt-*`) or **Tailwind space utilities** (`space-x-*`, `space-y-*`)
- Use `space-y-*` on parent containers for consistent vertical gaps between siblings
- Use `mt-*` on elements that need specific top spacing

### Icons & Iconography

- **Principle:** Always use the project's Iconify-based icon library. Do not import SVG files manually or paste inline SVG markup from the web.
- **logos** (`@iconify-json/logos`): Use for framework and tech logos (React, Vue, Svelte, Solid, Preact, GitHub, etc.). Icon names: `logos:react`, `logos:vue`, `logos:svelte`, `logos:solidjs`, `logos:preact`, `logos:github`, etc. Browse at [icon-sets.iconify.design/logos](https://icon-sets.iconify.design/logos/).
- **Solar Icon Collection** (`@iconify-json/solar`): Use for all other icons (search, close, settings, etc.). Icon names: `solar:magnifer-linear`, `solar:close-circle-linear`, etc.
- **Usage patterns:**
  - **Astro:** `import { Icon } from 'astro-icon/components'`; use `<Icon name="logos:react" />` or `<Icon name="solar:magnifer-linear" />`. Ensure the icon set is included in `astro.config.mjs` under the icon integration.
  - **React:** `import { Icon } from '@iconify/react'`; use `<Icon icon="logos:react" />` or `<Icon icon="solar:magnifer-linear" />`. Add `@iconify-json/logos` and/or `@iconify-json/solar` as dev dependencies if you need them bundled.
- **Avoid:** Manually writing or pasting SVG markup, importing `.svg` files for icons, or using other icon sets when logos or Solar would suffice.

### TypeScript

- **Strict mode**: Enabled (`strict: true` in `tsconfig.json`)
- **Module system**: ES Modules (`type: "module"`)
- **Target**: ES2022
- **Naming conventions**:
  - Classes: PascalCase (`Spotr`, `SpotrError`)
  - Functions: camelCase (`useSpotr`, `scoreItem`, `tokenize`)
  - Types/Interfaces: PascalCase (`SpotrOptions`, `SpotrResult`)
  - Constants: UPPER_SNAKE_CASE (`ErrorCodes`)
  - Private properties: Prefix with underscore (`_collection`, `_fields`)

### File Organization

- One main export per file (except index files)
- Index files (`index.ts`) re-export from implementation files
- Group related functionality in directories (`fuzzy/`, `utils/`)
- Framework integrations in separate directories (`react/`, `vue/`, etc.)

### Import/Export Patterns

```typescript
// Prefer named exports
export function useSpotr<T>(options: SpotrOptions<T>): Spotr<T> { ... }

// Re-export types from index files
export type { SpotrOptions, SpotrResult } from './types';

// Use type imports for types
import type { SpotrOptions } from '../types';
```

### Framework-Specific Patterns

#### React

- Use `useRef` for instance management
- Implement shallow equality checks for options
- Export hook and types from `react/index.ts`

```typescript
export function useSpotr<T extends object>(
  options: SpotrOptions<T>
): Spotr<T> { ... }
```

#### Vue

- Use `shallowRef` for reactive instance
- Use `watch` with `toValue` for reactive options
- Accept `MaybeRefOrGetter` for flexible API

```typescript
export function useSpotr<T extends object>(
  options: MaybeRefOrGetter<SpotrOptions<T>>
) { ... }
```

### Error Handling

- Use custom `SpotrError` class with error codes
- Define error codes as const object (`ErrorCodes`)
- Provide descriptive error messages
- Validate inputs early and throw errors immediately

## Testing Guidelines

### Framework

- **Vitest** with globals enabled (no need to import `describe`, `test`, `expect`)
- Node.js environment (not DOM)
- Test files: `test/*.test.ts` or `test/*.test.tsx`

### Test File Naming

- `*.test.ts` for TypeScript test files
- `*.test.tsx` for React component tests (if needed)

### Running Tests

- `bun run test` - Run all tests once
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:coverage:watch` - Run tests with coverage in watch mode
- `vitest run path/to/file.test.ts` - Run specific test file

### Test Structure

```typescript
import { describe, test, expect } from 'vitest';
import { Spotr } from '../src/Spotr';

describe('Spotr', () => {
  test('should match items', () => {
    // Test implementation
  });
});
```

### Code Coverage

- **Minimum Coverage Target**: **85%** for all metrics (lines, functions, branches, statements)
- Coverage thresholds are enforced in `vitest.default.config.ts` using Vitest's coverage thresholds
- Coverage configuration includes:
  - Global thresholds: 85% minimum for all source files
  - Per-file thresholds: Higher thresholds for critical code paths (e.g., fuzzy matching algorithms at 100%)
  - Exclusions: Type-only files, re-export index files, and test files are excluded from coverage
- Run `bun run test:coverage` to generate coverage reports
- Coverage reports are generated in multiple formats: text, JSON, HTML, and LCOV
- Coverage thresholds are enforced during test runs and will cause tests to fail if thresholds are not met

### Maintaining Test Coverage When Making Changes

**When modifying the `packages/spotr` library, agents MUST ensure test coverage is maintained:**

1. **For new features or functionality:**
   - Add comprehensive test cases covering the new functionality
   - Test both happy paths and edge cases
   - Ensure new code paths are covered by tests
   - Run `bun run test:coverage` to verify coverage meets the 85% threshold

2. **For changes to existing functionality:**
   - Update existing test cases if behavior has changed
   - Add new test cases if new code paths or edge cases are introduced
   - Ensure modified code paths are still covered by tests
   - Verify that updated tests accurately reflect the new behavior

3. **For bug fixes:**
   - Add test cases that reproduce the bug (regression tests)
   - Verify the fix resolves the issue
   - Ensure the fix doesn't break existing functionality

4. **For refactoring:**
   - Ensure existing tests still pass after refactoring
   - Update tests if the public API or behavior changes
   - Maintain or improve test coverage

5. **Removing obsolete or duplicate tests:**
   - Review test files when removing functionality or refactoring
   - Remove tests that are no longer relevant (e.g., testing removed features)
   - Identify and remove duplicate tests that test the same functionality
   - Consolidate similar tests into more comprehensive test cases when appropriate
   - Ensure removal doesn't reduce coverage below the 85% threshold

6. **Test coverage verification:**
   - Always run `bun run test:coverage` after making changes to the library
   - Review the coverage report to identify uncovered code paths
   - Add tests for any uncovered code paths introduced by your changes
   - Ensure coverage thresholds are met before considering changes complete

**Important:** Test coverage is a critical quality metric. Changes that reduce coverage below the 85% threshold will cause tests to fail and must be addressed before the changes can be considered complete.

### Pre-Commit Checks

- Run `bun run typecheck` before committing
- Run `bun run lint` before committing
- Run `bun run format` before committing
- Run `bun run test` before committing (or rely on CI)

**Note:** These checks should already pass if you followed the "Before Finishing Your Changes" workflow below. Pre-commit checks serve as a final verification.

## Before Finishing Your Changes

**When you have finished all edits for your task, before considering the task complete, you MUST:**

1. **Run TypeScript check on changed files:**
   - For the main library (`packages/spotr`): Run `bun run typecheck` from root, or use file-scoped checking: `tsc --noEmit path/to/file.ts` from `packages/spotr/` directory
   - For examples: If you changed example code, run `bun run examples:typecheck` from root, or run typecheck in the specific example directory (e.g., `cd examples/react/fields-basic && bun run typecheck`)
   - For site (`site/`): Run typecheck from the `site` directory if available, or run `tsc --noEmit` / Astro check as appropriate
   - See **File-Scoped Commands** section above for exact commands

2. **Fix all TypeScript errors:**
   - Resolve any TypeScript errors reported by the check
   - Re-run the TypeScript check until it passes with zero errors
   - Do not proceed until all TypeScript errors are fixed

3. **Run linter on changed files:**
   - For main library or examples: Run `bun run lint` from root, or use file-scoped checking: `eslint path/to/file.ts` or `bun run lint -- path/to/file.ts`
   - For site files: Run ESLint against site paths (e.g., `eslint site/src` from root if the config supports it)
   - See **File-Scoped Commands** section above for exact commands

4. **Fix all lint errors and warnings:**
   - Resolve any ESLint errors and warnings reported by the linter
   - Re-run the linter until it passes with zero errors and zero warnings
   - Do not proceed until all lint issues are fixed

5. **Run format:**
   - Run `bun run format` from root to format the codebase with Prettier

6. **Check test coverage (if changes were made to `packages/spotr`):**
   - If you modified any files in `packages/spotr/src/`, run `bun run test:coverage` from root
   - Review the coverage report to ensure:
     - Coverage meets the 85% threshold for all metrics
     - New functionality is covered by tests
     - Modified functionality has updated tests
     - No coverage regressions were introduced
   - Add or update tests as needed to maintain coverage
   - Remove obsolete or duplicate tests if functionality was removed or refactored
   - Re-run `bun run test:coverage` until coverage thresholds are met

**This workflow ensures that all code changes are type-safe, formatted, follow project linting standards, and maintain test coverage before the task is considered complete.** See **Pre-Commit Checks** above for final verification steps before committing.

## Git Workflow

### Pre-Commit Hooks

Husky is configured (`prepare` script) to run pre-commit hooks. Ensure all checks pass before committing.

### Commit Guidelines

- Commit shared file changes and synced files together when modifying `examples/shared/`
- Commit example-specific changes independently
- Don't commit `dist/` directory (build artifacts)
- Don't commit `node_modules/` (ignored)

### What to Commit

- ✅ Source code changes (`src/`, `test/`, `examples/`)
- ✅ Configuration files (`*.config.*`, `tsconfig.json`, `package.json`)
- ✅ Documentation (`README.md`, `AGENTS.md`)
- ✅ Synced files after running `examples:sync`
- ❌ Build output (`dist/`)
- ❌ Dependencies (`node_modules/`)

## Boundaries & Permissions

### ✅ Agents Can Do Without Permission

- Read any file in the repository
- Run linting on single files: `eslint path/to/file.ts`
- Run type checking on single files: `tsc --noEmit path/to/file.ts`
- Run tests on single files: `vitest run path/to/file.test.ts`
- Edit source code files
- Edit example files (following synced files rules)
- Run build commands locally

### ⚠️ Requires Approval

- Installing new packages (`bun add`, `bun install`)
- Updating dependencies (`bun update`)
- Modifying `package.json` dependencies
- Running production builds for release
- Git operations (commits, pushes, branch creation)
- Modifying CI/CD configuration
- Changing build configuration significantly

## Common Pitfalls

### Synced Files

- ❌ **Don't edit synced files directly** in example directories
- ✅ Always edit files in `examples/shared/` and run `bun run examples:sync`

### Build Artifacts

- ❌ **Don't modify `dist/` directory** - it's generated by `bun run build`
- ❌ **Don't commit `dist/`** - it's in `.gitignore`

### Framework-Specific Gotchas

- **React**: Options are compared with shallow equality - ensure stable references
- **Vue**: Options can be reactive - use `toValue()` to unwrap refs/getters
- **Svelte**: Store-based API differs from hooks pattern
- **TypeScript**: Ensure all types are exported from `src/index.ts` for framework packages

### Import Paths

- Use `'spotr'` for main library imports in examples
- Use `'spotr/react'`, `'spotr/vue'`, etc. for framework-specific imports
- Don't use relative paths to `../../src/` in examples (use published package)

### Type Checking

- Run `bun run typecheck` after making type changes
- Run `bun run examples:typecheck` to verify examples still type-check
- Framework integrations may have different type requirements

### Test Coverage

- ❌ **Don't skip test coverage checks** when modifying `packages/spotr/src/`
- ❌ **Don't remove tests** without ensuring coverage remains above 85%
- ❌ **Don't add new features** without corresponding test cases
- ✅ Always run `bun run test:coverage` after making library changes
- ✅ Update tests when modifying existing functionality
- ✅ Remove obsolete tests when removing functionality
- ✅ Consolidate duplicate tests to improve maintainability

### Icons

- ❌ **Don't paste inline SVGs from the web or add new SVG icon files**
- ✅ Use logos or Solar from Iconify instead

## Examples

### ✅ Correct: Editing Shared Files

**Task:** Update the Person type to include a new field.

1. Edit `examples/shared/types.ts`
2. Run `bun run examples:sync`
3. All examples now have the updated type

### ❌ Incorrect: Editing Synced Files Directly

**Task:** Update the Person type to include a new field.

1. ~~Edit `examples/react/fields-basic/src/types.ts`~~ ❌
2. Changes will be lost when sync script runs

### ✅ Correct: Editing Example-Specific Files

**Task:** Add a new button to the React fields-basic example.

1. Edit `examples/react/fields-basic/src/App.tsx`
2. No sync step needed

### ✅ Correct: Adding a New Framework Integration

**Task:** Add support for a new framework.

1. Create `src/{framework}/index.ts` with `useSpotr` implementation
2. Add entry point in `vite.config.ts`
3. Export from `package.json` exports field
4. Add tests in `test/{framework}.test.ts`
5. Update documentation

## Summary

- **Shared files** (`examples/shared/*`) → Edit here, then sync with `bun run examples:sync`
- **Synced files** (`examples/{framework}/{example}/src/{data|types|utils|styles}.*`) → Never edit directly
- **Example-specific files** (`examples/{framework}/{example}/src/{App|main}.*`) → Edit directly
- **Core library** (`src/`) → Standard TypeScript with strict mode
- **Tests** (`test/`) → Vitest with globals enabled
- **Build** → Vite with preserveModules for tree-shaking

When in doubt, check `scripts/sync-examples.ts` to see which files are synced.
