<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpotr } from 'spotr/vue';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';

const title = 'Keywords - Advanced';
const columns = [
  'title',
  'metadata.developer',
  'releaseYear',
  'platforms',
  'completed',
];
const textExamples = ['witcher', 'spider', 'zelda'];
const keywordExamples = ['done', 'ps5', 'xbox', 'recent'];
const LIMIT = 20;

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) =>
      i.platforms.some((p) => p.toLowerCase().includes(t))
    )
  );
const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);

const query = ref('');
const spotrRef = useSpotr({
  collection: gamesData,
  threshold: 0.3,
  fields: [
    { name: 'title', weight: 1 },
    { name: 'metadata.developer', weight: 0.9 },
  ],
  keywords: {
    mode: 'and',
    definitions: [
      {
        name: 'completed',
        triggers: ['done', 'complete', 'finished'],
        handler: completedHandler,
      },
      {
        name: 'platform',
        triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'],
        handler: platformHandler,
      },
      { name: 'recent', triggers: ['recent', 'new'], handler: recentHandler },
    ],
  },
  limit: LIMIT,
});

const result = computed(() => {
  if (!query.value.trim()) {
    return {
      results: gamesData
        .slice(0, LIMIT)
        .map((item) => ({ item, score: null as number | null })),
      matchedKeywords: [] as { name: string; terms: string[] }[],
      tokens: [] as string[],
      warnings: [] as string[],
    };
  }
  return (
    spotrRef.value?.query(query.value) ?? {
      results: [],
      matchedKeywords: [],
      tokens: [],
      warnings: [],
    }
  );
});
</script>

<template>
  <div class="container">
    <h1 class="title">{{ title }}</h1>
    <input
      v-model="query"
      type="search"
      placeholder="Search..."
      class="input"
    />
    <div class="example-groups">
      <div class="example-group">
        <span class="example-label">Try:</span>
        <button
          v-for="ex in textExamples"
          :key="ex"
          class="button"
          @click="query = ex"
        >
          {{ ex }}
        </button>
      </div>
      <div class="example-group">
        <span class="example-label">Keywords:</span>
        <button
          v-for="ex in keywordExamples"
          :key="ex"
          class="button"
          @click="query = ex"
        >
          {{ ex }}
        </button>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th class="th">Score</th>
          <th v-for="col in columns" :key="col" class="th">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in result.results" :key="i" class="tr">
          <td class="td">{{ r.score != null ? r.score.toFixed(2) : '-' }}</td>
          <td
            v-for="col in columns"
            :key="col"
            class="td"
            v-html="
              highlightCellValue(
                getNestedValue(r.item, col),
                col,
                result.matchedKeywords
              )
            "
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>
