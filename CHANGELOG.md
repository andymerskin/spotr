# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Nothing to report

## [1.0.0-alpha.1] - 2026-02-19

**⚠️ Note: Since this is an alpha, the library is still subject to breaking changes!**

### Added

- **`maxStringLength` option** - Truncates long query strings and collection field values for performance optimization. Defaults to 1000 characters. Adds entries to `result.warnings[]` when truncation occurs.
- **`MAX_STRING_LENGTH` export** - Constant exported for consumer use.
- **`KeywordMode` type export** - Exported for framework integrators.
- **Vitest benchmark** - Added `bun run bench` command for fuzzy matching performance testing.
- **`readonly T[]` support for collection** - `SpotrOptions.collection` now accepts `readonly T[]` in addition to `T[]` and `Set<T>`.
- **Type inference improvements** - Added `ExtractItemType` utility type and improved framework hook overloads to eliminate need for manual type coercion.

### Changed

- **`setCollection` validation** - Now validates the collection type via `validateCollection` and throws for invalid types (previously performed no validation).
- **Keyword handler error handling** - Handlers that return non-arrays now log to `console.error` and skip the filter instead of throwing. This prevents runtime crashes from bad user-provided handlers while keeping the search functionality operational.

### Security

- **Dependency updates** - Bumped dev and runtime dependency versions.

### Examples

- **Restructured examples** - Reorganized from single app per framework to categorized examples: `fields-basic`, `fields-nested`, `keywords-basic`, `keywords-advanced`, and `advanced-combined` across React, Vue, Svelte, Solid, and Preact.
- **Shared assets** - Added shared `styles.css` and sync script (`examples:sync`) to copy shared files into each example directory.
- **Icon system** - Switched from Skill Icons to Iconify (Solar + Logos icon sets).
- **Type improvements** - Added `tsconfig` files, tightened types, and coerced dataset types on JSON imports.
- **Data updates** - Updated sample queries and example data (people, games datasets).
- **Tooling** - Added NPM auditing script for examples, fixed Preact examples to use render function from `preact` library, and standardized on HTML search input usage.
