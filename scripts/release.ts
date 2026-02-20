import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const repoRoot = join(import.meta.dirname, '..');
const spotrPackageDir = join(repoRoot, 'packages', 'spotr');
const changelogPath = join(repoRoot, 'CHANGELOG.md');

// Create readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function exec(command: string, cwd?: string) {
  try {
    execSync(command, {
      cwd: cwd || repoRoot,
      stdio: 'inherit',
    });
  } catch {
    console.error(`\n❌ Command failed: ${command}`);
    if (cwd) {
      console.error(`   (in directory: ${cwd})`);
    }
    process.exit(1);
  }
}

function execWithOutput(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd: cwd || repoRoot,
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'inherit'],
    })
      .toString()
      .trim();
  } catch {
    console.error(`\n❌ Command failed: ${command}`);
    if (cwd) {
      console.error(`   (in directory: ${cwd})`);
    }
    process.exit(1);
  }
}

function getPackageVersion(): string {
  const packageJsonPath = join(spotrPackageDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

function checkChangelog(): boolean {
  if (!existsSync(changelogPath)) {
    console.warn('\n⚠️  CHANGELOG.md not found');
    return false;
  }

  const changelog = readFileSync(changelogPath, 'utf-8');
  // Check if there's a version section (not just [Unreleased])
  // Matches both regular versions (e.g., [1.0.0]) and prereleases (e.g., [1.0.0-alpha.1])
  const versionSectionRegex =
    /^## \[[\d.]+(?:-[a-zA-Z0-9.]+)?\] - \d{4}-\d{2}-\d{2}/m;
  const hasVersionSection = versionSectionRegex.test(changelog);

  if (!hasVersionSection) {
    console.warn(
      '\n⚠️  CHANGELOG.md appears to only have [Unreleased] section.'
    );
    console.warn(
      '   Please add a version section (e.g., ## [1.0.0] - 2025-02-19) before releasing.'
    );
    return false;
  }

  return true;
}

async function phase1Validation() {
  console.log('\n📋 Phase 1: Running validation checks...\n');

  console.log(
    '\n✓ Running validate (format:check, lint, typecheck, test:coverage, examples:typecheck, build)...'
  );
  exec('bun run validate');

  console.log('\n✓ Checking bundle size...');
  exec('bun run scripts/check-bundle-size.ts', repoRoot);

  console.log('\n✓ Checking CHANGELOG.md...');
  const changelogOk = checkChangelog();
  if (!changelogOk) {
    const answer = await question('\n⚠️  Continue anyway? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('\n❌ Release aborted. Please update CHANGELOG.md first.');
      process.exit(1);
    }
  }

  console.log('\n✅ All validation checks passed!\n');
}

async function phase2Release() {
  console.log('\n📦 Phase 2: Release process...\n');

  // Prerequisites
  console.log('✓ Checking npm authentication...');
  try {
    execSync('npm whoami', {
      cwd: spotrPackageDir,
      stdio: 'pipe',
    });
  } catch {
    console.error('\n❌ Not authenticated with npm. Please run: npm login');
    process.exit(1);
  }

  console.log('✓ Checking git working tree...');
  const gitStatus = execWithOutput('git status --porcelain');
  if (gitStatus) {
    console.error('\n❌ Working tree has uncommitted changes:');
    console.error(gitStatus);
    console.error('\nPlease commit or stash changes before releasing.');
    process.exit(1);
  }

  // Get version bump type from arguments
  const args = process.argv.slice(2);
  let versionBump: string;
  let preid: string | undefined;

  if (args.length > 0) {
    // Parse arguments - handle formats like:
    // - "patch", "minor", "major"
    // - "premajor", "preminor", "prepatch"
    // - "premajor --preid beta" or "premajor --preid=beta"
    // - "premajor--preid=beta" (combined format)
    // - "1.0.0-alpha.1" (exact version)

    versionBump = args[0];

    // Check for --preid flag in subsequent arguments
    const preidIndex = args.findIndex((arg) => arg.startsWith('--preid'));
    if (preidIndex !== -1) {
      const preidArg = args[preidIndex];
      // Handle both --preid=beta and --preid beta formats
      if (preidArg.includes('=')) {
        preid = preidArg.split('=')[1];
      } else if (args[preidIndex + 1]) {
        preid = args[preidIndex + 1];
      }
    }

    // Also check if preid is embedded in the version bump string (e.g., "premajor--preid=beta")
    if (!preid && versionBump.includes('--preid=')) {
      const match = versionBump.match(/--preid=(\w+)/);
      if (match) {
        preid = match[1];
        versionBump = versionBump.split('--preid=')[0];
      }
    }

    console.log(
      `\n✓ Using version bump type: ${versionBump}${preid ? ` with preid: ${preid}` : ''}`
    );
  } else {
    console.log('\nVersion bump options:');
    console.log('  - patch, minor, major');
    console.log('  - prerelease (increments existing pre-release)');
    console.log('  - premajor, preminor, prepatch');
    console.log('  - premajor --preid beta (or premajor --preid=beta)');
    console.log('  - exact version (e.g., 1.0.0, 1.0.0-alpha.1)');
    versionBump = await question('\nEnter version bump type: ');
  }

  if (!versionBump.trim()) {
    console.error('\n❌ Version bump type is required');
    process.exit(1);
  }

  // Get current version
  const currentVersion = getPackageVersion();
  console.log(`\n✓ Current version: ${currentVersion}`);

  // Build npm version command
  let npmVersionCommand: string;

  // Handle premajor/preminor/prepatch with optional preid
  if (
    versionBump.startsWith('pre') &&
    ['premajor', 'preminor', 'prepatch'].includes(versionBump)
  ) {
    const preidToUse = preid || 'alpha'; // Default to alpha if not specified
    npmVersionCommand = `npm version ${versionBump} --preid=${preidToUse} --no-workspaces-update`;
  } else {
    // For other types (patch, minor, major, prerelease, or exact version), use as-is
    npmVersionCommand = `npm version ${versionBump} --no-workspaces-update`;
  }

  console.log(`\n✓ Bumping version: ${npmVersionCommand}`);

  exec(npmVersionCommand, spotrPackageDir);

  // Get new version and tag
  const newVersion = getPackageVersion();
  const tag = `v${newVersion}`;
  console.log(`\n✓ New version: ${newVersion}`);
  console.log(`✓ Git tag: ${tag}`);

  // Check if npm version created a commit and tag (known npm workspace bug)
  const gitStatusAfterVersion = execWithOutput('git status --porcelain');
  const packageJsonModified = gitStatusAfterVersion.includes(
    'packages/spotr/package.json'
  );

  // Check if tag exists
  let tagExists = false;
  try {
    execSync(`git rev-parse ${tag}`, {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    tagExists = true;
  } catch {
    // Tag doesn't exist, tagExists remains false
  }

  // Create commit if npm version didn't (workspace bug workaround)
  if (packageJsonModified) {
    console.log(
      '\n⚠️  npm version did not create a commit (workspace bug). Creating commit manually...'
    );
    exec('git add packages/spotr/package.json');
    exec(`git commit -m "${newVersion}"`);
  }

  // Create tag if npm version didn't
  if (!tagExists) {
    console.log(
      '\n⚠️  npm version did not create a tag (workspace bug). Creating tag manually...'
    );
    exec(`git tag -a ${tag} -m "${newVersion}"`);
  }

  // Amend commit with CHANGELOG
  console.log('\n✓ Amending commit with CHANGELOG.md...');
  exec('git add CHANGELOG.md');
  exec('git commit --amend --no-edit');

  // Publish confirmation
  const shouldPublish = process.argv.includes('--no-publish')
    ? false
    : await question(`\n📤 Publish ${newVersion} to npm? (y/n): `);

  if (shouldPublish && shouldPublish.toLowerCase() === 'y') {
    // Determine npm tag
    let npmTag = 'latest';
    if (newVersion.includes('-alpha.')) {
      npmTag = 'alpha';
    } else if (newVersion.includes('-beta.')) {
      npmTag = 'beta';
    } else if (newVersion.includes('-rc.')) {
      npmTag = 'rc';
    }

    const publishCommand =
      npmTag === 'latest' ? 'npm publish' : `npm publish --tag ${npmTag}`;

    console.log(`\n✓ Publishing to npm with tag: ${npmTag}`);
    exec(publishCommand, spotrPackageDir);

    // Push commits and tags
    console.log('\n✓ Pushing commits and tags...');
    exec('git push origin master');
    exec(`git push origin ${tag}`);

    console.log(`\n✅ Successfully released ${newVersion}!`);
    console.log(`\n📦 Published to npm: https://www.npmjs.com/package/spotr`);
    console.log(`🏷️  Git tag: ${tag}`);
    console.log(
      '\n💡 Optional: Create a GitHub release at: https://github.com/andymerskin/spotr/releases/new'
    );
  } else {
    console.log('\n⚠️  Skipping npm publish.');
    console.log('   Version bumped and commit amended.');
    console.log('   Run manually:');
    console.log(`     cd packages/spotr`);
    const npmTag =
      newVersion.includes('-alpha.') ||
      newVersion.includes('-beta.') ||
      newVersion.includes('-rc.')
        ? `npm publish --tag ${newVersion.includes('-alpha.') ? 'alpha' : newVersion.includes('-beta.') ? 'beta' : 'rc'}`
        : 'npm publish';
    console.log(`     ${npmTag}`);
    console.log(`     cd ../..`);
    console.log(`     git push origin master`);
    console.log(`     git push origin ${tag}`);
  }
}

async function main() {
  try {
    await phase1Validation();
    await phase2Release();
  } catch (error) {
    console.error('\n❌ Release failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
