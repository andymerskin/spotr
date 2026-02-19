import type { Plugin } from 'rollup';
import { gzipSync } from 'zlib';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Rollup plugin that calculates the gzipped bundle size of the vanilla entry point
 * and writes it to bundle-size.json
 */
export function bundleSize(): Plugin {
  return {
    name: 'bundle-size',
    generateBundle(options, bundle) {
      // Only process ESM output (filter .js chunks, not .cjs)
      const esmChunks = Object.values(bundle).filter(
        (chunk) => chunk.type === 'chunk' && chunk.fileName.endsWith('.js')
      ) as Array<Extract<(typeof bundle)[string], { type: 'chunk' }>>;

      // Find the index.js chunk (vanilla entry)
      const indexChunk = esmChunks.find(
        (chunk) => chunk.fileName === 'index.js'
      );

      // Silently skip if this is CJS output (no index.js chunk)
      if (!indexChunk) {
        return;
      }

      // Recursively collect all chunks reachable via chunk.imports
      const collectedChunks = new Set<string>();
      const chunksToProcess = [indexChunk.fileName];

      while (chunksToProcess.length > 0) {
        const chunkFileName = chunksToProcess.pop()!;
        if (collectedChunks.has(chunkFileName)) continue;

        collectedChunks.add(chunkFileName);
        const chunk = esmChunks.find((c) => c.fileName === chunkFileName);
        if (chunk) {
          // Add all imported chunks to the processing queue
          for (const imported of chunk.imports) {
            if (!collectedChunks.has(imported)) {
              chunksToProcess.push(imported);
            }
          }
        }
      }

      // Collect chunk codes in dependency order (topological sort)
      // For simplicity, we'll concatenate in the order we collected them
      // This should be fine for gzip compression
      const chunkCodes: string[] = [];
      for (const chunkFileName of collectedChunks) {
        const chunk = esmChunks.find((c) => c.fileName === chunkFileName);
        if (chunk && chunk.code) {
          chunkCodes.push(chunk.code);
        }
      }

      // Concatenate all code
      const concatenatedCode = chunkCodes.join('\n');

      // Gzip the concatenated code
      const gzipped = gzipSync(Buffer.from(concatenatedCode, 'utf-8'));
      const gzipSize = gzipped.length;
      const formatted = formatSize(gzipSize);

      // Emit bundle-size.json
      this.emitFile({
        type: 'asset',
        fileName: 'bundle-size.json',
        source: JSON.stringify({ gzipSize, formatted }, null, 2),
      });
    },
  };
}
