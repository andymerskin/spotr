import { execSync } from 'child_process';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const repoRoot = join(import.meta.dirname, '..');

for (const framework of frameworks) {
  const exampleDir = join(repoRoot, 'examples', framework);
  console.log(`📦 Installing dependencies for ${framework}...`);
  
  try {
    execSync('npm install', {
      cwd: exampleDir,
      stdio: 'inherit',
    });
    console.log(`✅ ${framework} dependencies installed\n`);
  } catch (error) {
    console.error(`❌ Failed to install dependencies for ${framework}`);
    process.exit(1);
  }
}

console.log(`✅ All example dependencies installed successfully`);
