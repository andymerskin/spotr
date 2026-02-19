import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { bundleSize } from './rollup-plugin-bundle-size';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
        svelte: resolve(__dirname, 'src/svelte/index.ts'),
        solid: resolve(__dirname, 'src/solid/index.ts'),
        preact: resolve(__dirname, 'src/preact/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'vue',
        'svelte',
        'svelte/store',
        'solid-js',
        'preact',
        'preact/hooks',
      ],
      output: {
        preserveModules: true,
        globals: {
          react: 'React',
          vue: 'Vue',
          svelte: 'Svelte',
          'svelte/store': 'SvelteStore',
          'solid-js': 'Solid',
          preact: 'Preact',
          'preact/hooks': 'PreactHooks',
        },
      },
    },
    sourcemap: true,
  },
  plugins: [dts({ rollupTypes: true }), bundleSize()],
});
