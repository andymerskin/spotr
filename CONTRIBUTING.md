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
- `bun run test:coverage` - Run tests with coverage report
- `bun run typecheck` - Type check the library
- `bun run lint` - Lint the codebase
- `bun run format` - Format the codebase with Prettier
- `bun run format:check` - Check code format without modifying (Prettier)
- `bun run validate` - Full validation: format:check, lint, typecheck, test:coverage, examples:typecheck, build
- `bun run size:check` - Build and verify bundle size is under 5KB gzipped
- `bun run clean` - Remove `dist/` and `coverage/` directories

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

## Release Process

This section covers the process for releasing a new version of Spotr to npm.

**Release Approach:** Spotr uses **manual releases** with `npm version` and `npm publish`. This provides full control over the release process while automating version bumping, git commits, and tagging. For automated release workflows (e.g., semantic-release, Changesets), see the discussion in the project's agent transcripts.

**Quick Start:** The easiest way to release is using the release script:

```sh
bun run release
```

This script automates the entire release process: validation checks, version bumping, commit amending, and publishing. You can also pass a version bump type directly:

```sh
bun run release patch    # for patch releases
bun run release minor    # for minor releases
bun run release major    # for major releases
bun run release prerelease    # increment existing pre-release
bun run release premajor    # start major pre-release (defaults to alpha)
bun run release premajor --preid beta    # start major pre-release with beta tag
bun run release preminor --preid=rc    # start minor pre-release with rc tag
bun run release 1.0.0-alpha.1  # for specific versions
```

The script will guide you through the process interactively. For manual release steps (if needed), see the detailed process below.

### Prerequisites

- Ensure you have npm publish permissions for the `spotr` package
- Ensure you're authenticated with npm (`npm login` or `npm whoami`)
- Ensure all changes are committed and pushed to `master`
- Ensure CI checks are passing

### Pre-Release Checklist

The release script (`bun run release`) runs `validate` and bundle size check automatically. You can run these manually to verify before releasing:

1. **Run full validation:**

   ```sh
   bun run validate
   ```

   This runs `format:check`, `lint`, `typecheck`, `test:coverage`, `examples:typecheck`, and `build` in sequence.

2. **Verify bundle size:**

   ```sh
   bun run size:check
   ```

   This builds the package and verifies the gzipped bundle size is under **5KB**. The release script will fail if this limit is exceeded.

3. **CHANGELOG.md is updated:**
   - Move items from `[Unreleased]` to a new version section
   - Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
   - Use semantic versioning (e.g., `## [1.0.0] - 2025-02-19`)
   - Include all notable changes (Added, Changed, Deprecated, Removed, Fixed, Security)

### Release Steps

1. **Update CHANGELOG.md:**
   - Add a new version section with the release date
   - Move items from `[Unreleased]` to the new version section
   - Ensure the date format matches: `## [1.0.0] - 2025-02-19`

2. **Build the package:**

   ```sh
   bun run build
   ```

   This generates the `dist/` directory and `bundle-size.json` with gzipped bundle size.

3. **Verify the build output:**

   ```sh
   # Check that dist/ contains expected files
   ls -la packages/spotr/dist/

   # Verify bundle-size.json exists
   cat packages/spotr/dist/bundle-size.json

   # Verify bundle size is under 5KB (enforced by size:check)
   bun run size:check
   ```

   **Note:** The `prepack` and `prepublishOnly` lifecycle hooks in `packages/spotr/package.json` automatically run validation checks when you run `npm pack` or `npm publish`, providing an additional safety net for manual releases.

4. **Bump the version using `npm version`:**

   **Important:** When running `npm version` manually, you **must** include the `--no-workspaces-update` flag. This is because npm detects the workspace root and tries to process all workspace packages, including `site/package.json` which uses Bun's `workspace:*` protocol that npm doesn't understand. The `--no-workspaces-update` flag prevents npm from processing workspace packages, avoiding the `EUNSUPPORTEDPROTOCOL` error.

   **Note:** The release script (`bun run release`) automatically includes this flag, so you don't need to add it when using the script.

   For stable releases:

   ```sh
   cd packages/spotr
   npm version patch --no-workspaces-update    # for patch releases (1.0.0 -> 1.0.1)
   npm version minor --no-workspaces-update    # for minor releases (1.0.0 -> 1.1.0)
   npm version major --no-workspaces-update    # for major releases (1.0.0 -> 2.0.0)
   ```

   For pre-release versions, you can use automatic incrementing:

   **Starting a pre-release cycle:**

   ```sh
   npm version premajor --preid=alpha --no-workspaces-update    # 1.0.0 -> 2.0.0-alpha.0
   npm version preminor --preid=beta --no-workspaces-update     # 1.0.0 -> 1.1.0-beta.0
   npm version prepatch --preid=rc --no-workspaces-update        # 1.0.0 -> 1.0.1-rc.0
   ```

   **Incrementing an existing pre-release:**

   ```sh
   npm version prerelease --no-workspaces-update    # automatically increments: alpha.0 -> alpha.1, beta.1 -> beta.2, etc.
   ```

   **Alternative: Specify pre-release version manually:**

   ```sh
   npm version 1.0.0-alpha.1 --no-workspaces-update    # for specific alpha versions
   npm version 1.0.0-beta.1 --no-workspaces-update     # for specific beta versions
   npm version 1.0.0-rc.1 --no-workspaces-update       # for specific release candidates
   ```

   **Note:** `npm version` automatically:
   - Updates the version in `package.json`
   - Creates a git commit with the version bump
   - Creates a git tag (e.g., `v1.0.0` or `v1.0.0-alpha.1`)

   **Transitioning from pre-release to stable:**
   When ready to release a stable version from a pre-release (e.g., `1.0.0-rc.2` → `1.0.0`), use:

   ```sh
   npm version patch --no-workspaces-update    # removes pre-release suffix and increments patch
   npm version minor --no-workspaces-update    # removes pre-release suffix and increments minor
   npm version major --no-workspaces-update    # removes pre-release suffix and increments major
   ```

5. **Amend the commit to include CHANGELOG.md:**

   ```sh
   cd ../..  # return to repo root
   git add CHANGELOG.md
   git commit --amend --no-edit
   ```

   This ensures the release commit includes all release-related changes.

6. **Push commits and tags:**

   ```sh
   git push origin master
   git push origin v1.0.0  # replace with your version tag
   ```

7. **Publish to npm:**

   For stable releases:

   ```sh
   cd packages/spotr
   npm publish
   ```

   **Important:** For pre-release versions (alpha, beta, rc), you **must** use the `--tag` flag:

   ```sh
   npm publish --tag alpha    # for alpha releases
   npm publish --tag beta     # for beta releases
   npm publish --tag rc       # for release candidates
   ```

   **Why `--tag` is required for pre-releases:**
   - Without `--tag`, npm publishes pre-release versions to the `latest` tag by default
   - This means users running `npm install spotr` would get the pre-release version instead of the stable version
   - Using `--tag` publishes to a custom distribution tag (e.g., `alpha`, `beta`, `rc`) instead of `latest`
   - Users can install pre-releases explicitly: `npm install spotr@alpha` or `npm install spotr@1.0.0-alpha.1`

   **Note:** The `npm version` command does not affect `npm publish` behavior—you must always use `--tag` when publishing pre-release versions, regardless of how you bumped the version.

8. **Verify the release:**
   - Check npm: `https://www.npmjs.com/package/spotr`
   - Verify the version appears correctly
   - Test installing the package: `npm install spotr@1.0.0`

9. **Create a GitHub release (optional but recommended):**
   - Go to the repository's Releases page
   - Click "Draft a new release"
   - Select the tag you just created
   - Copy the changelog entry for this version as the release description
   - Click "Publish release"

### Post-Release

After a successful release:

1. **Update the `[Unreleased]` section in CHANGELOG.md:**
   - Ensure it's ready for the next release cycle
   - Add a placeholder if needed

2. **Verify the website updates:**
   - The site should automatically rebuild and deploy via GitHub Actions
   - Check that the version number and bundle size display correctly on the landing page

3. **Announce the release (if applicable):**
   - Update any relevant documentation
   - Notify users if there are breaking changes

### Version Numbering

Follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

For pre-releases:

- **Alpha** (`-alpha.N`): Early development releases, may be unstable
- **Beta** (`-beta.N`): Feature-complete but may have bugs
- **Release Candidate** (`-rc.N`): Potentially final release, testing for issues

### Troubleshooting

**If npm publish fails:**

- Verify you're logged in: `npm whoami`
- Check you have publish permissions for the package
- Ensure the version number hasn't been published before
- For pre-releases, ensure you're using the correct `--tag` flag

**If the build fails:**

- Ensure all dependencies are installed: `bun install`
- Check for TypeScript errors: `bun run typecheck`
- Verify Vite configuration is correct

**If tests fail:**

- Run tests locally: `bun run test`
- Check test coverage: `bun run test:coverage`
- Ensure all tests pass before releasing
