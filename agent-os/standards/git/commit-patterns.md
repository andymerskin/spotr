# Git Commit Patterns

## Synced Files

Commit shared + synced files together after `examples:sync`:

```bash
bun run examples:sync
git add examples/shared/ examples/*/*/src/data/ examples/*/*/src/types.ts ...
git commit -m "feat: update shared example data"
```

## Ignored Files

Never commit:

- `dist/` directories
- `node_modules/` directories

## Release Process

- `bun run release` requires approval—do not run without explicit permission
- npm workspace bug workaround is handled automatically by `scripts/release.ts`

## Framework-Specific Notes

### React

Ensure stable option references (shallow equality comparison). See `spotr/react-option-stability.md`.

### Vue

Use `toValue()` to unwrap refs/getters in `useSpotr`. See `spotr/framework-integration-apis.md`.

### TypeScript

Ensure all types are exported from `packages/spotr/src/index.ts` for framework packages to access them.
