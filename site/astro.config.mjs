import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

// Get branch name from environment variable (set by GitHub Actions workflow)
// Fallback to 'master' for local development
const branchName = (typeof process !== 'undefined' && process.env?.PUBLIC_STACKBLITZ_BRANCH) || 'master';

// Set base path for GitHub Pages deployment
// GitHub Pages project sites serve from /spotr/, so base must include the repository name
// For master branch, use /spotr/, for other branches use /spotr/<branch-name>/
const base = branchName === 'master' ? '/spotr/' : `/spotr/${branchName}/`;

// https://astro.build/config
export default defineConfig({
  site: 'https://andymerskin.github.io',
  base,

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    icon({
      include: {
        'logos': ['react', 'vue', 'svelte-icon', 'solidjs-icon', 'preact', 'github-icon'],
      },
    }),
  ]
});