import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

/**
 * Runs only the Preact integration test with react -> preact/compat so JSX
 * produces Preact vNodes (avoids "object is not extensible" in Preact's diff).
 */
export default defineConfig({
  plugins: [preact()],
  test: {
    name: 'preact',
    globals: true,
    include: ['test/preact.test.tsx'],
    environment: 'happy-dom',
  },
});
