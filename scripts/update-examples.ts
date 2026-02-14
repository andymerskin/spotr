import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const repoRoot = join(import.meta.dirname, '..');

// Read the version from root package.json
const rootPackageJsonPath = join(repoRoot, 'package.json');
const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf-8'));
const spotrVersion = rootPackageJson.version;

if (!spotrVersion) {
  console.error('❌ Could not find version in root package.json');
  process.exit(1);
}

console.log(`📦 Updating examples to use spotr version: ${spotrVersion}\n`);

// Update each example's package.json
for (const framework of frameworks) {
  const exampleDir = join(repoRoot, 'examples', framework);
  const packageJsonPath = join(exampleDir, 'package.json');
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Ensure dependencies exist
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // Update spotr to use exact version (no ^ or ~ prefix)
    // Remove any file: or link: prefixes to ensure remote package
    packageJson.dependencies.spotr = spotrVersion;
    
    // Write back with proper formatting (2 space indent)
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    
    console.log(`✅ Updated ${framework}: spotr@${spotrVersion}`);
  } catch (error) {
    console.error(`❌ Failed to update ${framework}:`, error);
    process.exit(1);
  }
}

console.log(`\n✅ All example package.json files updated successfully`);
