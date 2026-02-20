<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpotr } from 'spotr/vue';
import peopleData from './data/people.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Person } from './types';

const title = 'Fields - Nested';
const columns = ['firstName', 'lastName', 'address.city', 'company.name'];
const examples = ['los angeles', 'los angelas', 'acme', 'dunder'];

const config = {
  collection: peopleData as Person[],
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
};

const query = ref('');
const spotrRef = useSpotr(
  config as import('vue').MaybeRefOrGetter<import('spotr').SpotrOptions<Person>>
);

const result = computed(() => {
  if (!query.value.trim()) {
    return {
      results: (peopleData as Person[])
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
