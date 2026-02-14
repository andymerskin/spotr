import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Get branch name from environment variable (set by GitHub Actions workflow)
// Fallback to 'master' for local development
const branchName = (typeof process !== 'undefined' && process.env?.PUBLIC_STACKBLITZ_BRANCH) || 'master';

// Set base path for GitHub Pages deployment
// GitHub Pages project sites automatically serve from /spotr/, so base should only be the path within the project
// For master branch, use /, for other branches use /<branch-name>/
const base = branchName === 'master' ? '/' : `/${branchName}/`;

// https://astro.build/config
export default defineConfig({
  site: 'https://andymerskin.github.io',
  base,
  vite: {
    plugins: [tailwindcss()]
  }
});