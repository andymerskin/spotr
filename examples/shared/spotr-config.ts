import peopleData from './people.json';
import gamesData from './games.json';
import { PEOPLE_EXAMPLES, GAMES_EXAMPLES } from './utils';

export type SectionKey =
  | 'fields-basic'
  | 'fields-nested'
  | 'keywords-basic'
  | 'keywords-advanced'
  | 'advanced-combined';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: { city: string; country: string };
  company: { name: string; location?: { city: string } };
  subscribed: boolean;
}

export interface Game {
  id: number;
  title: string;
  platforms: string[];
  releaseYear: number;
  completed: boolean;
  metadata: { developer: string; publisher: string };
}

// Default handlers for each section
export const keywordHandlers: Record<
  SectionKey,
  Record<string, (collection: Game[], matchedTerms?: string[]) => Game[]>
> = {
  'fields-basic': {},
  'fields-nested': {},
  'keywords-basic': {
    completed: (collection: Game[]) => collection.filter((item) => item.completed),
  },
  'keywords-advanced': {
    completed: (collection: Game[]) => collection.filter((item) => item.completed),
    platform: (collection: Game[], matchedTerms?: string[]) =>
      collection.filter((item) =>
        (matchedTerms ?? []).some((term) =>
          item.platforms.some((p) => p.toLowerCase().includes(term))
        )
      ),
    recent: (collection: Game[]) => collection.filter((item) => item.releaseYear >= 2020),
  },
  'advanced-combined': {
    completed: (collection: Game[]) => collection.filter((item) => item.completed),
    platform: (collection: Game[], matchedTerms?: string[]) => {
      const platformMap: Record<string, string[]> = {
        sony: ['ps4', 'ps5'],
        nintendo: ['switch', 'wii'],
        microsoft: ['xbox'],
      };
      const expandedTerms = (matchedTerms ?? []).flatMap((term) => platformMap[term.toLowerCase()] || [term]);
      return collection.filter((item) =>
        expandedTerms.some((term) =>
          item.platforms.some((p) => p.toLowerCase().includes(term))
        )
      );
    },
  },
};

export const sections: Record<
  SectionKey,
  {
    title: string;
    description: string;
    data: Person[] | Game[];
    config: Record<string, unknown>;
    columns: string[];
    examples: string[];
  }
> = {
  'fields-basic': {
    title: 'Fields - Basic',
    description: 'Simple field configuration with weights and thresholds.',
    data: peopleData as Person[],
    config: {
      threshold: 0.3,
      fields: [
        { name: 'firstName', weight: 1 },
        { name: 'lastName', weight: 1 },
        { name: 'email', weight: 0.7 },
      ],
      limit: 20,
    },
    columns: ['firstName', 'lastName', 'email'],
    examples: PEOPLE_EXAMPLES,
  },
  'fields-nested': {
    title: 'Fields - Nested',
    description: 'Dot notation for deeply nested object properties.',
    data: peopleData as Person[],
    config: {
      threshold: 0.3,
      fields: [
        { name: 'firstName', weight: 1 },
        { name: 'lastName', weight: 1 },
        { name: 'address.city', weight: 0.8 },
        { name: 'address.country', weight: 0.6 },
        { name: 'company.name', weight: 0.7 },
        { name: 'company.location.city', weight: 0.5 },
      ],
      limit: 20,
    },
    columns: ['firstName', 'lastName', 'address.city', 'company.name'],
    examples: PEOPLE_EXAMPLES,
  },
  'keywords-basic': {
    title: 'Keywords - Basic',
    description: 'Single keyword definition for exact filtering.',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [{ name: 'title', weight: 1 }],
      keywords: [
        {
          name: 'completed',
          triggers: ['done', 'complete', 'finished'],
        },
      ],
      limit: 20,
    },
    columns: ['title', 'releaseYear', 'completed'],
    examples: GAMES_EXAMPLES,
  },
  'keywords-advanced': {
    title: 'Keywords - Advanced',
    description: 'Multiple keyword definitions with and/or modes.',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [{ name: 'title', weight: 1 }],
      keywords: {
        mode: 'and',
        definitions: [
          {
            name: 'completed',
            triggers: ['done', 'complete', 'finished'],
          },
          {
            name: 'platform',
            triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'],
          },
          {
            name: 'recent',
            triggers: ['recent', 'new'],
          },
        ],
      },
      limit: 20,
    },
    columns: ['title', 'platforms', 'releaseYear', 'completed'],
    examples: GAMES_EXAMPLES,
  },
  'advanced-combined': {
    title: 'Advanced - Combined',
    description: 'Full-featured example combining fields, nested fields, and keywords.',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [
        { name: 'title', weight: 1 },
        { name: 'metadata.developer', weight: 0.8 },
        { name: 'metadata.publisher', weight: 0.6 },
      ],
      keywords: {
        mode: 'and',
        definitions: [
          {
            name: 'completed',
            triggers: ['done', 'complete', 'finished'],
          },
          {
            name: 'platform',
            triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch', 'sony', 'nintendo', 'microsoft'],
          },
        ],
      },
      limit: 20,
    },
    columns: ['title', 'metadata.developer', 'metadata.publisher', 'completed'],
    examples: GAMES_EXAMPLES,
  },
};
