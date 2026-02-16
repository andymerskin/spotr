# Contributing to Spotr

Thanks for your interest in contributing. This document covers how to get set up and what to expect when submitting changes.

## Setup

This project uses [Bun](https://bun.sh) as the package manager.

```sh
bun install
```

## Development Scripts

From the repository root:

- `bun run build` - Build the library (outputs to `dist/`)
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode
- `bun run typecheck` - Type check the library
- `bun run lint` - Lint the codebase
- `bun run format` - Format the codebase with Prettier

For examples:

- `bun run examples:sync` - Sync shared files from `examples/shared/` to all examples
- `bun run examples:typecheck` - Type check all example applications
- `bun run examples:install` - Install dependencies for all examples

## Pull Requests

1. Fork the repository and create a branch from `master`
2. Make your changes
3. Run `bun run lint`, `bun run typecheck`, and `bun run test` before submitting
4. Ensure code is formatted with `bun run format`
5. Open a PR with a clear description of the change

CI runs lint on every push and PR. Tests and typecheck are expected to pass locally before merging.

## Synced Files

Files in `examples/shared/` are synced to all example directories. **Do not edit** `types.ts`, `utils.ts`, `styles.css`, or `data/*.json` directly in individual examples—edit the shared files and run `bun run examples:sync`. See [AGENTS.md](./AGENTS.md) for details.
