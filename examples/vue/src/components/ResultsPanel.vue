<script setup lang="ts">
import { computed } from 'vue';
import { Spotr } from '../../../../src/index';
import { getNestedValue, formatCellValue } from '../../../shared/utils';
import type { Person, Game } from '../../../shared/spotr-config';

interface SectionConfig {
  title: string;
  description: string;
  columns: string[];
  examples: string[];
  config: Record<string, unknown>;
}

const props = defineProps<{
  sectionConfig: SectionConfig;
  modelValue: string;
  spotr: Spotr<Person | Game> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function updateQuery(value: string) {
  emit('update:modelValue', value);
}

const result = computed(() => {
  if (!props.modelValue.trim()) {
    const limit =
      (props.sectionConfig.config.limit as number) || Infinity;
    return {
      results:
        props.spotr?.collection
          .slice(0, limit)
          .map((item) => ({ item, score: null as number | null })) || [],
      matchedKeywords: [],
      tokens: [],
      warnings: [],
    };
  }
  return (
    props.spotr?.query(props.modelValue) ?? {
      results: [],
      matchedKeywords: [],
      tokens: [],
      warnings: [],
    }
  );
});
</script>

<template>
  <div class="flex-1 p-8 overflow-auto">
    <div class="max-w-[960px]">
      <h1 class="text-2xl font-bold mb-2 text-neutral-100">
        {{ sectionConfig.title }}
      </h1>
      <p class="text-neutral-400 mb-6">{{ sectionConfig.description }}</p>

      <div class="mb-4">
        <input
          type="text"
          :value="modelValue"
          @input="updateQuery(($event.target as HTMLInputElement).value)"
          placeholder="Search..."
          class="w-full px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="mb-4 flex gap-2 flex-wrap">
        <button
          v-for="ex in sectionConfig.examples"
          :key="ex"
          @click="updateQuery(ex)"
          class="px-3 py-1 text-sm bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600"
        >
          {{ ex }}
        </button>
      </div>

      <div
        v-if="result.matchedKeywords.length > 0"
        class="mb-4 text-sm text-neutral-400"
      >
        <span class="font-medium">Matched Keywords:</span>
        <span
          v-for="k in result.matchedKeywords"
          :key="k.name"
          class="keyword-highlight ml-2"
        >
          {{ k.name }} ({{ k.terms.join(", ") }})
        </span>
      </div>

      <div
        v-if="result.warnings.length > 0"
        class="mb-4 text-sm text-amber-400 bg-amber-900/30 p-2 rounded"
      >
        <span class="font-medium">Warnings:</span>
        {{ [...new Set(result.warnings)].join("; ") }}
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-neutral-800 border border-neutral-700">
          <thead>
            <tr class="bg-neutral-700">
              <th
                class="px-4 py-2 text-left text-sm font-medium text-neutral-300"
              >
                Score
              </th>
              <th
                v-for="col in sectionConfig.columns"
                :key="col"
                class="px-4 py-2 text-left text-sm font-medium text-neutral-300"
              >
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in result.results"
              :key="i"
              class="border-t border-neutral-700 hover:bg-neutral-700/50"
            >
              <td class="px-4 py-2 text-sm text-neutral-200">
                {{ r.score !== null ? r.score.toFixed(2) : "-" }}
              </td>
              <td
                v-for="col in sectionConfig.columns"
                :key="col"
                class="px-4 py-2 text-sm text-neutral-200"
              >
                {{ formatCellValue(getNestedValue(r.item, col)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyword-highlight {
  background-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
