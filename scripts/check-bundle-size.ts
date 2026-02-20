import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MAX_GZIP_BYTES = 5 * 1024; // 5 KB
const repoRoot = join(import.meta.dirname, '..');
const bundleSizePath = join(
  repoRoot,
  'packages',
  'spotr',
  'dist',
  'bundle-size.json'
);

if (!existsSync(bundleSizePath)) {
  console.error('❌ bundle-size.json not found. Run "bun run build" first.');
  process.exit(1);
}

const { gzipSize } = JSON.parse(readFileSync(bundleSizePath, 'utf-8')) as {
  gzipSize: number;
  formatted: string;
};

if (gzipSize > MAX_GZIP_BYTES) {
  console.error(
    `❌ Bundle size ${(gzipSize / 1024).toFixed(1)} kB exceeds limit of ${MAX_GZIP_BYTES / 1024} kB`
  );
  process.exit(1);
}

console.log(
  `✓ Bundle size OK: ${(gzipSize / 1024).toFixed(1)} kB (limit: ${MAX_GZIP_BYTES / 1024} kB)`
);
