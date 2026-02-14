<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpotr } from '../../../src/vue';
import peopleData from '../../shared/people.json';
import gamesData from '../../shared/games.json';
import { getNestedValue, highlightCellValue } from '../../shared/utils';
import type { Person, Game } from '../../shared/types';

type SectionKey =
  | 'fields-basic'
  | 'fields-nested'
  | 'keywords-basic'
  | 'keywords-advanced'
  | 'advanced-combined';

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) => i.platforms.some((p) => p.toLowerCase().includes(t)))
  );
const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);
const platformAdvancedHandler = (col: Game[], terms?: string[]) => {
  const map: Record<string, string[]> = {
    sony: ['ps4', 'ps5'],
    nintendo: ['switch', 'wii'],
    microsoft: ['xbox'],
  };
  const expanded = (terms ?? []).flatMap((t) => map[t.toLowerCase()] ?? [t]);
  return col.filter((i) =>
    expanded.some((t) => i.platforms.some((p) => p.toLowerCase().includes(t)))
  );
};

const SECTION_CONFIGS: Record<
  SectionKey,
  {
    title: string;
    data: Person[] | Game[];
    config: {
      threshold: number;
      fields: { name: string; weight: number }[];
      keywords?: unknown;
      limit: number;
    };
    columns: string[];
    examples: string[];
  }
> = {
  'fields-basic': {
    title: 'Fields - Basic',
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
    examples: ['alice', 'johnson', 'acme', 'usa'],
  },
  'fields-nested': {
    title: 'Fields - Nested',
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
    examples: ['alice', 'johnson', 'acme', 'usa'],
  },
  'keywords-basic': {
    title: 'Keywords - Basic',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [{ name: 'title', weight: 1 }],
      keywords: [
        { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
      ],
      limit: 20,
    },
    columns: ['title', 'releaseYear', 'completed'],
    examples: ['witcher', 'done', 'ps5', 'nintendo'],
  },
  'keywords-advanced': {
    title: 'Keywords - Advanced',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [{ name: 'title', weight: 1 }],
      keywords: {
        mode: 'and',
        definitions: [
          { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
          { name: 'platform', triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'], handler: platformHandler },
          { name: 'recent', triggers: ['recent', 'new'], handler: recentHandler },
        ],
      },
      limit: 20,
    },
    columns: ['title', 'platforms', 'releaseYear', 'completed'],
    examples: ['witcher', 'done', 'ps5', 'nintendo'],
  },
  'advanced-combined': {
    title: 'Advanced - Combined',
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
          { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
          {
            name: 'platform',
            triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch', 'sony', 'nintendo', 'microsoft'],
            handler: platformAdvancedHandler,
          },
        ],
      },
      limit: 20,
    },
    columns: ['title', 'metadata.developer', 'metadata.publisher', 'completed'],
    examples: ['witcher', 'done', 'ps5', 'nintendo'],
  },
};

function getSectionFromUrl(): SectionKey {
  const params = new URLSearchParams(window.location.search);
  const ex = params.get('example');
  if (ex && ex in SECTION_CONFIGS) return ex as SectionKey;
  return 'fields-basic';
}

const section = ref<SectionKey>(getSectionFromUrl());
const query = ref('');

const sec = computed(() => SECTION_CONFIGS[section.value]);

const spotrOptions = computed(() => ({
  collection: sec.value.data,
  ...sec.value.config,
}));

const spotrRef = useSpotr(spotrOptions as import('vue').MaybeRefOrGetter<import('../../../src/types').SpotrOptions<Person | Game>>);

const result = computed(() => {
  if (!query.value.trim()) {
    const limit = sec.value.config.limit;
    return {
      results: (sec.value.data as (Person | Game)[])
        .slice(0, limit)
        .map((item) => ({ item, score: null as number | null })),
      matchedKeywords: [] as { name: string; terms: string[] }[],
      tokens: [] as string[],
      warnings: [] as string[],
    };
  }
  return spotrRef.value?.query(query.value) ?? {
    results: [],
    matchedKeywords: [],
    tokens: [],
    warnings: [],
  };
});
</script>

<template>
  <div class="container">
    <h1 class="title">{{ sec.title }}</h1>
    <input
      v-model="query"
      type="text"
      placeholder="Search..."
      class="input"
    />
    <div class="buttons">
      <button
        v-for="ex in sec.examples"
        :key="ex"
        class="button"
        @click="query = ex"
      >
        {{ ex }}
      </button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th class="th">Score</th>
          <th v-for="col in sec.columns" :key="col" class="th">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in result.results" :key="i" class="tr">
          <td class="td">{{ r.score != null ? r.score.toFixed(2) : '-' }}</td>
          <td
            v-for="col in sec.columns"
            :key="col"
            class="td"
            v-html="highlightCellValue(getNestedValue(r.item, col), col, result.matchedKeywords)"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.container {
  font-family: sans-serif;
  padding: 16px;
  background-color: #1a1a1a;
  color: #e5e5e5;
  min-height: 100vh;
  max-width: 960px;
  margin: 0 auto;
}
.title {
  font-size: 24px;
  margin-bottom: 16px;
}
.input {
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #e5e5e5;
  border-radius: 4px;
}
.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.button {
  padding: 4px 12px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
}
.table {
  border-collapse: collapse;
  width: 100%;
}
.th {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #444;
  background-color: #2a2a2a;
}
.tr {
  border-bottom: 1px solid #333;
}
.td {
  padding: 8px 12px;
}
</style>

<style>
.keyword-highlight {
  background: #fef08a;
  font-weight: bold;
}
</style>
