import { execSync } from 'child_process';
import { cpSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const examples = [
  'fields-basic',
  'fields-nested',
  'keywords-basic',
  'keywords-advanced',
  'advanced-combined',
];
const repoRoot = join(import.meta.dirname, '..');

/**
 * Run npm in an isolated temp dir to generate package-lock.json.
 * npm doesn't support workspace:*, and running from the example dir would
 * pick up the root workspace (site uses spotr workspace:*). Isolating
 * ensures npm only sees the example's package.json.
 */
function generatePackageLock(exampleDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tempDir = mkdtempSync(join(tmpdir(), 'spotr-example-'));
    try {
      cpSync(join(exampleDir, 'package.json'), join(tempDir, 'package.json'));
      execSync('npm install --package-lock-only', {
        cwd: tempDir,
        stdio: 'inherit',
      });
      cpSync(
        join(tempDir, 'package-lock.json'),
        join(exampleDir, 'package-lock.json')
      );
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      rmSync(tempDir, { recursive: true });
    }
  });
}

async function main() {
  // Install all workspace deps once (packages/spotr, site, all examples)
  // Using --ignore-scripts to skip husky prepare script during scripted install
  console.log('📦 Installing all workspace dependencies...');
  execSync('bun install --ignore-scripts', {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  console.log('✅ Workspace dependencies installed\n');

  // Collect all example directories for npm lock generation
  const exampleDirs: Array<{
    dir: string;
    framework: string;
    example: string;
  }> = [];
  for (const framework of frameworks) {
    for (const example of examples) {
      exampleDirs.push({
        dir: join(repoRoot, 'examples', framework, example),
        framework,
        example,
      });
    }
  }

  // Generate package-lock.json files for StackBlitz (npm-only)
  // Run in parallel batches to speed up (5 at a time to avoid overwhelming npm)
  if (!process.env.CI) {
    const CONCURRENCY = 5;
    console.log(
      `📦 Generating package-lock.json files for ${exampleDirs.length} examples...\n`
    );

    for (let i = 0; i < exampleDirs.length; i += CONCURRENCY) {
      const batch = exampleDirs.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async ({ dir, framework, example }) => {
          try {
            console.log(
              `📦 Generating package-lock.json for ${framework}/${example}...`
            );
            await generatePackageLock(dir);
            console.log(
              `✅ ${framework}/${example} package-lock.json generated`
            );
          } catch (error) {
            console.error(
              `❌ Failed to generate package-lock.json for ${framework}/${example}:`,
              error
            );
            throw error;
          }
        })
      );
    }
    console.log('');
  }

  console.log(`✅ All example dependencies installed successfully`);
}

main().catch((error) => {
  console.error('❌ Installation failed:', error);
  process.exit(1);
});
