export const examples = [
  { slug: 'fields-basic', title: 'Fields - Basic' },
  { slug: 'fields-nested', title: 'Fields - Nested' },
  { slug: 'keywords-basic', title: 'Keywords - Basic' },
  { slug: 'keywords-advanced', title: 'Keywords - Advanced' },
  { slug: 'advanced-combined', title: 'Advanced - Combined' },
] as const;

export type ExampleSlug = (typeof examples)[number]['slug'];

export const frameworks = [
  { id: 'react', name: 'React', logo: '⚛️' },
  { id: 'vue', name: 'Vue', logo: '💚' },
  { id: 'svelte', name: 'Svelte', logo: '✨' },
  { id: 'solid', name: 'Solid', logo: '🔷' },
  { id: 'preact', name: 'Preact', logo: '⚡' },
] as const;

export type FrameworkId = (typeof frameworks)[number]['id'];
