import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

// Set base path for GitHub Pages deployment
// GitHub Pages project sites serve from /spotr/, so base must include the repository name
const base = '/spotr/';

// https://astro.build/config
export default defineConfig({
  site: 'https://andymerskin.github.io',
  base,

  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 700,
    },
  },

  integrations: [
    react(),
    icon({
      include: {
        logos: [
          'react',
          'vue',
          'svelte-icon',
          'solidjs-icon',
          'preact',
          'github-icon',
        ],
      },
    }),
  ],
});
