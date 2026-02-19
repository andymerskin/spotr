import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'default',
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/preact.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Only include source files in coverage
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts', // Exclude re-export index files
        'src/types.ts', // Exclude type-only files
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/node_modules/**',
        '**/dist/**',
        '**/vitest*.config.ts',
        '**/vite.config.ts',
      ],
      thresholds: {
        // 90% coverage target for source files
        lines: 88,
        functions: 90,
        branches: 90,
        statements: 88,
        // Per-file thresholds (config files lower the global average)
        'src/Spotr.ts': {
          lines: 90,
          functions: 90,
          branches: 95,
          statements: 90,
        },
        'src/fuzzy/**': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        'src/utils/**': {
          lines: 90,
          functions: 100,
          branches: 90,
          statements: 90,
        },
        'src/react/index.ts': {
          lines: 89,
          functions: 90,
          branches: 80,
          statements: 89,
        },
        'src/preact/index.ts': {
          lines: 89,
          functions: 90,
          branches: 80,
          statements: 89,
        },
      },
      reportOnFailure: true,
    },
  },
});
