import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const frameworks = ['react', 'vue', 'svelte', 'solid', 'preact'];
const examples = ['fields-basic', 'fields-nested', 'keywords-basic', 'keywords-advanced', 'advanced-combined'];
const repoRoot = join(import.meta.dirname, '..');
const sharedDir = join(repoRoot, 'examples', 'shared');

// Data file mapping: which examples need which data files
const exampleDataFiles: Record<string, string[]> = {
  'fields-basic': ['people.json'],
  'fields-nested': ['people.json'],
  'keywords-basic': ['games.json'],
  'keywords-advanced': ['games.json'],
  'advanced-combined': ['games.json'],
};

// Ensure data directories exist in each example
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleDir = join(repoRoot, 'examples', framework, example);
    const dataDir = join(exampleDir, 'src', 'data');
    
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
  }
}

// Copy data files to each example's src/data/
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleDataDir = join(repoRoot, 'examples', framework, example, 'src', 'data');
    const dataFiles = exampleDataFiles[example] || [];
    
    for (const dataFile of dataFiles) {
      const sourcePath = join(sharedDir, dataFile);
      const targetPath = join(exampleDataDir, dataFile);
      if (existsSync(sourcePath)) {
        const content = readFileSync(sourcePath, 'utf-8');
        writeFileSync(targetPath, content);
      }
    }
  }
}

// Copy types.ts to each example's src/
const typesTs = readFileSync(join(sharedDir, 'types.ts'), 'utf-8');
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleSrcDir = join(repoRoot, 'examples', framework, example, 'src');
    writeFileSync(join(exampleSrcDir, 'types.ts'), typesTs);
  }
}

// Copy utils.ts but update the import to use 'spotr' instead of '../../src/types'
const utilsTs = readFileSync(join(sharedDir, 'utils.ts'), 'utf-8');
const adaptedUtilsTs = utilsTs.replace(
  "import type { MatchedKeyword } from '../../src/types';",
  "import type { MatchedKeyword } from 'spotr';"
);

for (const framework of frameworks) {
  for (const example of examples) {
    const exampleSrcDir = join(repoRoot, 'examples', framework, example, 'src');
    writeFileSync(join(exampleSrcDir, 'utils.ts'), adaptedUtilsTs);
  }
}

// Copy styles.css to each example's src/
const stylesCss = readFileSync(join(sharedDir, 'styles.css'), 'utf-8');
for (const framework of frameworks) {
  for (const example of examples) {
    const exampleSrcDir = join(repoRoot, 'examples', framework, example, 'src');
    writeFileSync(join(exampleSrcDir, 'styles.css'), stylesCss);
  }
}

console.log(`✅ Synced shared files to ${frameworks.length * examples.length} example folders`);
