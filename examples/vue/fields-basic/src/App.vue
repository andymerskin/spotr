<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpotr } from 'spotr/vue';
import peopleData from './data/people.json';
import { getNestedValue, highlightCellValue } from './utils';

const title = 'Fields - Basic';
const columns = ['firstName', 'lastName', 'email'];
const examples = ['alice', 'aloce', 'wayne', 'acme.com'];
const LIMIT = 20;

const query = ref('');
const spotrRef = useSpotr({
  collection: peopleData,
  threshold: 0.3,
  fields: [
    { name: 'firstName', weight: 1 },
    { name: 'lastName', weight: 1 },
    { name: 'email', weight: 0.8 },
  ],
  limit: LIMIT,
});

const result = computed(() => {
  if (!query.value.trim()) {
    return {
      results: peopleData
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
