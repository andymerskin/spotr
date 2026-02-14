import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'vue'],
      output: {
        preserveModules: true,
        globals: {
          react: 'React',
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
  },
  plugins: [dts({ rollupTypes: true })],
});
