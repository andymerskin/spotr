export const examples = [
  { slug: 'fields-basic', title: 'Fields - Basic', description: 'Fuzzy search over flat fields (`firstName`, `lastName`, `email`) with weighted scoring.' },
  { slug: 'fields-nested', title: 'Fields - Nested', description: 'Search across nested paths like `address.city` and `company.name` using dot notation.' },
  { slug: 'keywords-basic', title: 'Keywords - Basic', description: 'Single custom keyword with a handler—e.g. `done` filters to completed items only.' },
  { slug: 'keywords-advanced', title: 'Keywords - Advanced', description: 'Multiple keywords with AND mode: platform, completed, and recency filters combined.' },
  { slug: 'advanced-combined', title: 'Combined', description: 'Nested fields plus keywords with custom handlers (e.g. platform aliases like `sony` → `ps4` / `ps5`).' },
] as const;

export type ExampleSlug = (typeof examples)[number]['slug'];

export const frameworks = [
  { id: 'react', name: 'React', logo: 'logos:react' },
  { id: 'vue', name: 'Vue', logo: 'logos:vue' },
  { id: 'svelte', name: 'Svelte', logo: 'logos:svelte-icon' },
  { id: 'solid', name: 'Solid', logo: 'logos:solidjs-icon' },
  { id: 'preact', name: 'Preact', logo: 'logos:preact' },
] as const;

export type FrameworkId = (typeof frameworks)[number]['id'];
