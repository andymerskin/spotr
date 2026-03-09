# Testing Coverage & Setup

## Test Framework

- **Vitest** with globals enabled
- Test files: `packages/spotr/test/*.test.ts`

## Coverage Requirements

**85% minimum coverage** (lines, functions, branches, statements) enforced for `packages/spotr/src/`.

Run `bun run test:coverage` after any change to `packages/spotr/src/`.

## Test Practices

- **Add tests** for new features
- **Update tests** for changed behavior
- **Add regression tests** for bugs
- **Remove obsolete tests** when removing functionality
- **Don't let coverage drop below 85%**

## Coverage Enforcement

Coverage threshold is enforced in test configuration. If coverage drops below 85%, tests will fail.
