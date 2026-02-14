import { execSync } from 'child_process';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const examples = ['fields-basic', 'fields-nested', 'keywords-basic', 'keywords-advanced', 'advanced-combined'];
const repoRoot = join(import.meta.dirname, '..');

// First run typecheck in the root
console.log('🔍 Running typecheck in root...');
try {
  execSync('bun run typecheck', {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  console.log('✅ Root typecheck passed\n');
} catch {
  console.error('❌ Root typecheck failed');
  process.exit(1);
}

// Then run typecheck in each example directory
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleDir = join(repoRoot, 'examples', framework, example);
    console.log(`🔍 Running typecheck for ${framework}/${example}...`);
    
    try {
      execSync('bun run typecheck', {
        cwd: exampleDir,
        stdio: 'inherit',
      });
      console.log(`✅ ${framework}/${example} typecheck passed\n`);
    } catch {
      console.error(`❌ Failed to typecheck ${framework}/${example}`);
      process.exit(1);
    }
  }
}

console.log(`✅ All typechecks passed successfully`);
