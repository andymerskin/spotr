import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface BundleSizeData {
  gzipSize: number;
  formatted: string;
}

/**
 * Gets the GZipped bundle size of the spotr library.
 * Reads the bundle-size.json file generated during the spotr build.
 * @param importMetaUrl - The import.meta.url from the calling file
 * @returns Formatted bundle size string (e.g., "2.9 kB") or "N/A" if file cannot be read
 */
export function getBundleSize(importMetaUrl: string): string {
  const __dirname = path.dirname(fileURLToPath(importMetaUrl));
  const bundleSizePath = path.resolve(
    __dirname,
    '../../../packages/spotr/dist/bundle-size.json'
  );

  try {
    const fileContent = fs.readFileSync(bundleSizePath, 'utf-8');
    const data: BundleSizeData = JSON.parse(fileContent);
    return data.formatted;
  } catch (err) {
    // File doesn't exist or can't be read
    console.warn('Could not read bundle size:', err);
    return 'N/A';
  }
}
