<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpotr } from 'spotr/vue';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';

const title = 'Keywords - Basic';
const columns = ['title', 'releaseYear', 'completed'];
const examples = ['witcher', 'done', 'ps5', 'nintendo'];

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);

const config = {
  collection: gamesData as Game[],
  threshold: 0.3,
  fields: [{ name: 'title', weight: 1 }],
  keywords: [
    { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
  ],
  limit: 20,
};

const query = ref('');
const spotrRef = useSpotr(config as import('vue').MaybeRefOrGetter<import('spotr').SpotrOptions<Game>>);

const result = computed(() => {
  if (!query.value.trim()) {
    return {
      results: (gamesData as Game[]).slice(0, config.limit).map((item) => ({ item, score: null as number | null })),
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
    <h1 class="title">{{ title }}</h1>
    <input
      v-model="query"
      type="search"
      placeholder="Search..."
      class="input"
    />
    <div class="buttons">
      <button
        v-for="ex in examples"
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
            v-html="highlightCellValue(getNestedValue(r.item, col), col, result.matchedKeywords)"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>
