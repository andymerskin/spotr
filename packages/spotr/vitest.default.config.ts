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
        // 85% coverage target for all source files (matches AGENTS.md)
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
        // Per-file thresholds: Higher thresholds for critical code paths
        'src/Spotr.ts': {
          lines: 90,
          functions: 90,
          branches: 90,
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
          functions: 90,
          branches: 90,
          statements: 90,
        },
        'src/react/index.ts': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/preact/index.ts': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/vue/index.ts': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/svelte/index.ts': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/solid/index.ts': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
      reportOnFailure: true,
    },
  },
});
