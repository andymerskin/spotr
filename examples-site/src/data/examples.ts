export const examples = [
  { slug: 'fields-basic', title: 'Fields - Basic' },
  { slug: 'fields-nested', title: 'Fields - Nested' },
  { slug: 'keywords-basic', title: 'Keywords - Basic' },
  { slug: 'keywords-advanced', title: 'Keywords - Advanced' },
  { slug: 'advanced-combined', title: 'Advanced - Combined' },
] as const;

export type ExampleSlug = (typeof examples)[number]['slug'];

export const frameworks = [
  { id: 'react', name: 'React', logo: 'react' },
  { id: 'vue', name: 'Vue', logo: 'vue' },
  { id: 'svelte', name: 'Svelte', logo: 'svelte' },
  { id: 'solid', name: 'Solid', logo: 'solid' },
  { id: 'preact', name: 'Preact', logo: 'preact' },
] as const;

export type FrameworkId = (typeof frameworks)[number]['id'];
