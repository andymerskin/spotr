import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: {
    spotr: {
      title: 'Spotr',
      description:
        'A powerful fuzzy search library for client-side collections.',
    },
  },
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    fonts: [
      'https://cdn.jsdelivr.net/fontsource/fonts/work-sans@latest/latin-400-normal.ttf', // Work Sans Regular (400)
      'https://cdn.jsdelivr.net/fontsource/fonts/work-sans@latest/latin-600-normal.ttf', // Work Sans Semi-bold (600)
    ],
    logo: {
      path: './public/spotr.png',
      size: [240, 240],
    },
    bgGradient: [
      [0, 0, 0], // black
      [8, 51, 68], // cyan-950 (#083344)
    ],
    border: {
      color: [34, 211, 238], // cyan-400 (#22d3ee)
      width: 8,
      side: 'inline-start', // left side
    },
    font: {
      title: {
        families: ['Work Sans'],
        weight: 'SemiBold', // Semi-bold for title
      },
      description: {
        families: ['Work Sans'],
        weight: 'Normal', // Regular for description
      },
    },
  }),
});
