<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpotr } from 'spotr/vue';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';

const title = 'Keywords - Advanced';
const columns = ['title', 'platforms', 'releaseYear', 'completed'];
const examples = ['witcher', 'done', 'ps5', 'nintendo'];

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) =>
      i.platforms.some((p) => p.toLowerCase().includes(t))
    )
  );
const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);

const config = {
  collection: gamesData as Game[],
  threshold: 0.3,
  fields: [{ name: 'title', weight: 1 }],
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
  limit: 20,
};

const query = ref('');
const spotrRef = useSpotr(
  config as import('vue').MaybeRefOrGetter<import('spotr').SpotrOptions<Game>>
);

const result = computed(() => {
  if (!query.value.trim()) {
    return {
      results: (gamesData as Game[])
        .slice(0, config.limit)
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
