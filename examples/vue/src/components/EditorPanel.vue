<script setup lang="ts">
import { computed } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark';

const props = defineProps<{
  modelValue: string;
  width: number;
  parseError: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  reset: [];
}>();

const extensions = [javascript(), vsCodeDark];

const editorValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

function handleReset() {
  emit('reset');
}
</script>

<template>
  <div
    class="shrink-0 border-l border-neutral-700 flex flex-col bg-neutral-900"
    :style="{ width: width + 'px' }"
  >
    <div
      class="p-3 border-b border-neutral-700 flex items-center justify-between"
    >
      <h3 class="text-sm font-medium text-neutral-300">Config Editor</h3>
      <button
        @click="handleReset"
        class="text-xs text-neutral-400 hover:text-neutral-200"
      >
        Reset
      </button>
    </div>
    <div class="flex-1 overflow-hidden">
      <Codemirror
        v-model="editorValue"
        :extensions="extensions"
        :style="{ height: '100%' }"
        class="text-sm"
      />
    </div>
    <div
      v-if="parseError"
      class="p-2 text-xs text-red-400 bg-red-900/30 border-t border-red-800"
    >
      Parse Error: {{ parseError }}
    </div>
    <div class="p-2 text-xs text-neutral-500 border-t border-neutral-700">
      Keywords handlers are fixed per example
    </div>
  </div>
</template>

<style scoped>
/* Make CodeMirror fill its container */
:deep(.cm-editor) {
  height: 100% !important;
}

:deep(.cm-scroller) {
  overflow: auto !important;
}
</style>
