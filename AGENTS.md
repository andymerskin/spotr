# AI Agent Guidelines

This document provides comprehensive guidelines for AI agents working on the Spotr codebase.

## Project Overview & Tech Stack

**Spotr** is a powerful and minimal client-side fuzzy search library with zero dependencies.

### Core Technologies

- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: Bun (v1.3.9)
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

- Bun v1.3.9 (specified in `packageManager` field)
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
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:coverage:watch` - Run tests with coverage in watch mode
- `bun run typecheck` - Type check main library (`tsc --noEmit`)
- `bun run audit` - Audit the Spotr package for vulnerabilities and apply fixes (`scripts/audit-spotr.ts`)
- `bun run lint` - Lint codebase (ESLint)
- `bun run format` - Format codebase (Prettier, whole repo from root)
- `bun run format:check` - Check formatting (Prettier, no write)
- `bun run validate` - Full validation before release (format:check, lint, typecheck, test:coverage, examples:typecheck, build)
- `bun run size:check` - Build and enforce 5KB bundle size limit
- `bun run clean` - Remove dist and coverage directories

### Example Commands

- `bun run examples:typecheck` - Type check all examples
- `bun run examples:sync` - Sync shared files to examples (`scripts/sync-examples.ts`)
- `bun run examples:install` - Install example dependencies (`scripts/install-examples.ts`)
- `bun run examples:update` - Update example dependencies (`scripts/update-examples.ts`)
- `bun run examples:audit` - Audit all example packages for vulnerabilities and apply fixes (`scripts/audit-examples.ts`)
- `bun run examples:dev` - Launch interactive dev servers for a selected framework (`scripts/dev-examples.ts`)
  - Prompts to select a framework (react, vue, svelte, solid, preact)
  - Launches all 5 examples for the selected framework concurrently
  - Servers run on ports 5173-5177 (Vite's default port range)
  - Displays clickable URLs for easy access to each example

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

- **Type Definitions & External Dependencies**:
  - **Prefer external type packages**: Always use official or community-maintained type definition packages (e.g., `@types/bun`, `@types/node`) instead of writing custom `.d.ts` files for external libraries
  - **Installation**: Add type packages as `devDependencies` in `package.json`:
    ```json
    {
      "devDependencies": {
        "@types/bun": "^1.3.9",
        "@types/node": "^25.3.0"
      }
    }
    ```
  - **Configuration**: Reference types in `tsconfig.json` via the `types` array:
    ```json
    {
      "compilerOptions": {
        "types": ["node", "bun"]
      }
    }
    ```
  - **Example**: The project previously had a custom `scripts/bun.d.ts` file, which was replaced with the official `@types/bun` package. This approach is preferred because:
    - Type definitions stay up-to-date through package updates
    - Reduces maintenance burden of custom type files
    - Follows TypeScript ecosystem best practices
    - Ensures consistency with official API definitions
  - **When custom types are acceptable**: Only create custom `.d.ts` files when:
    - No official or community type definitions exist for a library (e.g., `@types/*` packages don't exist)
    - Types need to be project-specific extensions or augmentations (e.g., module augmentation)
    - Types are for internal project code, not external libraries
  - **Discouraged approach**:
    ```typescript
    // ❌ Don't create custom types for libraries with existing type packages
    // scripts/bun.d.ts
    declare module 'bun' {
      export function spawn(...): Bun.Subprocess;
    }
    ```
  - **Preferred approach**:
    ```bash
    # ✅ Install official type package
    bun add -d @types/bun
    ```
    ```json
    // ✅ Reference in tsconfig.json
    {
      "compilerOptions": {
        "types": ["bun"]
      }
    }
    ```

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

#### Error Severity Model

The library follows a severity-based error handling approach to prevent consumer pages from crashing:

**1. Programmer Errors (Configuration/Setup) - THROW**

- **When**: Errors that occur during library initialization or configuration
- **Examples**: Invalid collection type, invalid field config, invalid options
- **Action**: Throw `SpotrError` synchronously - fail fast so developers can fix configuration issues immediately
- **Location**: Constructor, `setCollection`, validation functions
- **Rationale**: These are setup-time errors that indicate incorrect usage. Failing fast prevents silent bugs.

**2. Runtime Programmer Errors (User-Provided Code) - LOG & RECOVER**

- **When**: Errors caused by user-provided code (e.g., keyword handlers) that execute during normal operation
- **Examples**: Keyword handler returns non-array, handler throws exception
- **Action**: Use `console.error` to log the issue, then recover gracefully (skip the problematic operation, return safe fallback)
- **Location**: `query()`, `_applyKeywords()`, and other runtime methods
- **Rationale**: These errors occur during user interaction (e.g., typing a search query). Throwing would crash the page. Logging allows developers to fix bugs while keeping the app functional.

**3. Recoverable/Non-Fatal Issues - WARNINGS**

- **When**: Issues that don't prevent functionality but indicate suboptimal conditions
- **Examples**: String truncation due to `maxStringLength`, performance warnings
- **Action**: Add messages to `result.warnings[]` array or use `console.warn` for developer feedback
- **Location**: Fuzzy matching, scoring functions
- **Rationale**: These are informational - the library continues to work, but developers should be aware of the condition.

#### Error Handling Rules

- **DO throw** for configuration/setup errors (constructor, `setCollection`) - these are programmer errors that should fail fast
- **DO NOT throw** for runtime errors caused by user-provided code (e.g., keyword handlers) - use `console.error` and safe fallback instead
- **DO use** `result.warnings[]` or `console.warn` for non-fatal, recoverable issues - never throw for these
- **DO validate** all public API methods (`setCollection`, etc.) consistently with constructor validation
- **DO provide** clear, actionable error messages that help developers identify and fix issues

#### Examples

**Configuration Error (Throw):**

```typescript
// ❌ Invalid collection - throw immediately
new Spotr({ collection: 'not-an-array', fields: ['name'] });
// Throws: SpotrError: collection must be an Array or Set, received string
```

**Runtime Error (Log & Recover):**

```typescript
// ✅ Keyword handler returns wrong type - log error, skip filter, continue
const spotr = new Spotr({
  collection: items,
  fields: ['name'],
  keywords: [
    {
      name: 'filter',
      triggers: ['filter'],
      handler: () => null, // Returns non-array
    },
  ],
});
spotr.query('filter test'); // Logs error, returns results without filter applied
```

**Non-Fatal Issue (Warning):**

```typescript
// ✅ Long string truncated - add to warnings, continue
const result = spotr.query('very long query...');
// result.warnings: ['Query string truncated from 2000 to 1000 characters...']
```

#### Testing Error Handling

When adding or modifying error handling:

- Test that configuration errors throw `SpotrError` with correct error codes
- Test that runtime errors (e.g., bad keyword handlers) log `console.error` and recover gracefully
- Test that warnings are added to `result.warnings` for non-fatal issues
- Use `vi.spyOn(console, 'error')` or `vi.spyOn(console, 'warn')` to verify logging in tests

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
   - Note: `bun run format:check` can be used to verify formatting without modifying files (useful for CI-style checks)

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

7. **Update README documentation (if library API or functionality changed):**
   - If you modified the library API, added new functions, changed functionality, or removed features, update `README.md` at the repository root
   - Review and update the following sections as needed:
     - **Features** - Add new features or remove deprecated ones
     - **Basic Usage** - Update code examples to reflect API changes
     - **Options** - Update option descriptions, add new options, or remove deprecated ones
     - **Framework Integrations** - Update framework-specific usage examples if hooks/composables changed
     - **API Reference** - Update function signatures, return types, or method descriptions
   - Ensure all code examples in the README are accurate and reflect current API usage
   - Verify that any removed functionality is clearly marked as deprecated or removed

8. **Update website landing page example (if library functionality changed):**
   - Review `site/src/pages/index.astro` and `site/src/components/LandingSearchDemo.*` (or similar demo components)
   - Verify that the interactive demo on the landing page:
     - Uses the current API correctly
     - Demonstrates functionality that still exists in the library
     - Reflects any API changes or new features
     - Works correctly with the current library version
   - Check that any code examples displayed on the landing page (e.g., in `HeaderCodeExample` component) match the current API
   - Update demo configurations if they use deprecated or changed options
   - Test the landing page demo to ensure it functions correctly

9. **Review and update framework examples (if library functionality changed):**
   - Review all examples in `examples/{react|vue|svelte|solid|preact}/` directories
   - For each framework, check all example types:
     - `fields-basic` - Basic field matching examples
     - `fields-nested` - Nested field examples
     - `keywords-basic` - Basic keyword examples
     - `keywords-advanced` - Advanced keyword examples
     - `advanced-combined` - Combined features examples
   - Verify that each example:
     - Uses the current API correctly
     - Demonstrates functionality that still exists
     - Reflects any API changes or new features
     - Works correctly with the current library version
   - Update example code if it uses deprecated APIs or needs to showcase new functionality
   - Run example typechecks: `bun run examples:typecheck` to ensure all examples still compile
   - Test examples manually or verify they build successfully if automated testing is available

**This workflow ensures that all code changes are type-safe, formatted, follow project linting standards, maintain test coverage, and keep documentation and examples up-to-date before the task is considered complete.** See **Pre-Commit Checks** above for final verification steps before committing.

### Delegating to Subagents

Agents can delegate the "Before Finishing Your Changes" workflow tasks to subagents for parallel execution or when handling complex multi-step verification. When instructing subagents to handle these tasks:

1. **Provide complete context:**
   - List all files that were modified during the task
   - Describe what changes were made (API changes, bug fixes, new features, etc.)
   - Specify which parts of the workflow are relevant (e.g., if only library code changed, documentation updates may not be needed)
   - Reference this AGENTS.md file and the "Before Finishing Your Changes" section

2. **Structure the task clearly:**
   - Break down the workflow into specific, actionable steps
   - Specify which commands to run and in which directories
   - Provide clear success criteria (e.g., "zero TypeScript errors", "zero lint warnings", "coverage above 85%")

3. **Example subagent instruction:**

   ```
   You are tasked with completing the "Before Finishing Your Changes" workflow
   for the Spotr library. The following files were modified:
   - packages/spotr/src/Spotr.ts (added new method: searchWithOptions)
   - packages/spotr/src/types.ts (added new type: SearchOptions)

   Please follow the workflow in AGENTS.md section "Before Finishing Your Changes":
   1. Run TypeScript check on changed files and fix any errors
   2. Run linter on changed files and fix any errors/warnings
   3. Run format to ensure code is formatted
   4. Check test coverage (library code was modified) - ensure 85% threshold is met
   5. Update README.md if API changed (new method was added)
   6. Update website landing page if needed
   7. Review framework examples to ensure they still work

   Report back with the results of each step and any issues that need to be addressed.
   ```

4. **Use appropriate subagent types:**
   - `generalPurpose` - For comprehensive verification tasks that require reading files, running commands, and making fixes
   - `shell` - For running verification commands in sequence (typecheck, lint, format, test coverage)
   - `explore` - For reviewing examples and documentation to ensure they're up-to-date

5. **Parallel execution:**
   - Some tasks can run in parallel (e.g., typecheck and lint can run simultaneously)
   - Documentation review can happen in parallel with test coverage checks
   - Be mindful of dependencies (e.g., formatting should happen before final verification)

6. **Reporting:**
   - Subagents should report back with:
     - Which steps completed successfully
     - Any errors or warnings found and how they were fixed
     - Test coverage results
     - Documentation updates made
     - Any issues that require attention

**Note:** The parent agent is still responsible for ensuring all workflow steps are completed before considering the task complete. Subagents help execute the steps but don't replace the parent agent's oversight.

## Git Workflow

### Pre-Commit Hooks

Husky is configured (`prepare` script) to run pre-commit hooks. Ensure all checks pass before committing.

### Release Process

The release script (`bun run release`) runs `validate` (format:check, lint, typecheck, test:coverage, examples:typecheck, build) and bundle size check before proceeding with version bumping and publishing. **Do not run `bun run release` without approval** (see Boundaries & Permissions section). The script automates the release process and includes safety checks via `prepack` and `prepublishOnly` lifecycle hooks in `packages/spotr/package.json`.

**npm Workspace Bug Workaround:** Due to a known npm bug with workspaces (npm/cli#4017, npm/cli#6337), `npm version` may not automatically commit and tag changes when the package.json is in a subdirectory (`packages/spotr/`). The release script (`scripts/release.ts`) automatically detects this by checking for uncommitted package.json changes and missing git tags after running `npm version`. If npm version failed to create a commit or tag, the script will create them manually before proceeding with the release process.

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
- Running the release script (`bun run release`)
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
