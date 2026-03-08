import { readFileSync, writeFileSync } from 'fs';
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

// Read the version from packages/spotr (the published package)
const spotrPackageJsonPath = join(
  repoRoot,
  'packages',
  'spotr',
  'package.json'
);
const spotrPackageJson = JSON.parse(
  readFileSync(spotrPackageJsonPath, 'utf-8')
);
const spotrVersion = spotrPackageJson.version;

if (!spotrVersion) {
  console.error('❌ Could not find version in packages/spotr/package.json');
  process.exit(1);
}

console.log(`📦 Updating examples to use spotr@^${spotrVersion}\n`);

// Update each example's package.json
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleDir = join(repoRoot, 'examples', framework, example);
    const packageJsonPath = join(exampleDir, 'package.json');

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // Ensure dependencies exist
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      // Use published npm package with caret for semver flexibility
      // Examples run in StackBlitz and need the public package (no file: or workspace:)
      packageJson.dependencies.spotr = `^${spotrVersion}`;

      // Write back with proper formatting (2 space indent)
      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n',
        'utf-8'
      );

      console.log(`✅ Updated ${framework}/${example}: spotr@^${spotrVersion}`);
    } catch (error) {
      console.error(`❌ Failed to update ${framework}/${example}:`, error);
      process.exit(1);
    }
  }
}

console.log(`\n✅ All example package.json files updated successfully`);
