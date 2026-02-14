import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const repoRoot = join(import.meta.dirname, '..');
const sharedDir = join(repoRoot, 'examples', 'shared');

// Ensure data directory exists in each example
for (const framework of frameworks) {
  const exampleDir = join(repoRoot, 'examples', framework);
  const dataDir = join(exampleDir, 'src', 'data');
  
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Copy people.json and games.json to each example's src/data/
for (const framework of frameworks) {
  const exampleDataDir = join(repoRoot, 'examples', framework, 'src', 'data');
  
  // Copy people.json
  const peopleJson = readFileSync(join(sharedDir, 'people.json'), 'utf-8');
  writeFileSync(join(exampleDataDir, 'people.json'), peopleJson);
  
  // Copy games.json
  const gamesJson = readFileSync(join(sharedDir, 'games.json'), 'utf-8');
  writeFileSync(join(exampleDataDir, 'games.json'), gamesJson);
}

// Copy types.ts to each example's src/
const typesTs = readFileSync(join(sharedDir, 'types.ts'), 'utf-8');
for (const framework of frameworks) {
  const exampleSrcDir = join(repoRoot, 'examples', framework, 'src');
  writeFileSync(join(exampleSrcDir, 'types.ts'), typesTs);
}

// Copy utils.ts but update the import to use 'spotr' instead of '../../src/types'
const utilsTs = readFileSync(join(sharedDir, 'utils.ts'), 'utf-8');
const adaptedUtilsTs = utilsTs.replace(
  "import type { MatchedKeyword } from '../../src/types';",
  "import type { MatchedKeyword } from 'spotr';"
);

for (const framework of frameworks) {
  const exampleSrcDir = join(repoRoot, 'examples', framework, 'src');
  writeFileSync(join(exampleSrcDir, 'utils.ts'), adaptedUtilsTs);
}

console.log(`✅ Synced shared files to ${frameworks.length} example folders`);
