import { execSync } from 'child_process';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const examples = [
  'fields-basic',
  'fields-nested',
  'keywords-basic',
  'keywords-advanced',
  'advanced-combined',
];
const repoRoot = join(import.meta.dirname, '..');

for (const framework of frameworks) {
  for (const example of examples) {
    const exampleDir = join(repoRoot, 'examples', framework, example);
    console.log(`📦 Installing dependencies for ${framework}/${example}...`);

    try {
      if (!process.env.CI) {
        execSync('npm install', {
          cwd: exampleDir,
          stdio: 'inherit',
        });
      }
      execSync('bun install', {
        cwd: exampleDir,
        stdio: 'inherit',
      });
      console.log(`✅ ${framework}/${example} dependencies installed\n`);
    } catch (error) {
      console.error(
        `❌ Failed to install dependencies for ${framework}/${example}`
      );
      process.exit(1);
    }
  }
}

console.log(`✅ All example dependencies installed successfully`);
