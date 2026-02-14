<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Spotr } from "../../../src/index";
import spotrLogo from "../../shared/spotr.svg";
import {
  extractEditableConfig,
  parseConfigWithHandlers,
  EDITOR_WIDTH_KEY,
  DEFAULT_EDITOR_WIDTH,
  MIN_EDITOR_WIDTH,
} from "../../shared/utils";
import { keywordHandlers, sections, type SectionKey, type Person, type Game } from "../../shared/spotr-config";
import ResultsPanel from "./components/ResultsPanel.vue";
import ResizeHandle from "./components/ResizeHandle.vue";
import EditorPanel from "./components/EditorPanel.vue";

const section = ref<SectionKey>("fields-basic");
const query = ref("");
const editorContent = ref("");
const parseError = ref<string | null>(null);
const savedWidth = localStorage.getItem(EDITOR_WIDTH_KEY);
const editorWidth = ref(
  savedWidth ? parseInt(savedWidth, 10) : DEFAULT_EDITOR_WIDTH,
);

const isDragging = ref(false);

const sectionConfig = computed(() => sections[section.value]);

// Initialize editor content when section changes
watch(
  section,
  () => {
    const editableConfig = extractEditableConfig(sectionConfig.value.config);
    editorContent.value = JSON.stringify(editableConfig, null, 2);
    parseError.value = null;
  },
  { immediate: true },
);

// Parse editor content and merge with handlers
const parsedConfig = computed(() => {
  try {
    const parsed = JSON.parse(editorContent.value);
    parseError.value = null;

    // Merge with handlers from section defaults
    const merged = parseConfigWithHandlers(parsed, keywordHandlers[section.value]);
    return merged;
  } catch (e) {
    parseError.value = (e as Error).message;
    return null;
  }
});

const spotr = ref<Spotr<Person | Game> | null>(null);

// Update spotr when config changes
watch(
  [parsedConfig, sectionConfig],
  ([parsed, config]) => {
    const spotrConfig = parsed
      ? { collection: config.data, ...parsed }
      : { collection: config.data, ...config.config };

    spotr.value = new Spotr(
      spotrConfig as ConstructorParameters<typeof Spotr<Person | Game>>[0],
    );
  },
  { immediate: true },
);

const spotrValue = computed<Spotr<Person | Game> | null>(() => spotr.value as Spotr<Person | Game> | null);

function setSection(key: SectionKey) {
  section.value = key;
  query.value = "";
}

function resetEditor() {
  const editableConfig = extractEditableConfig(sectionConfig.value.config);
  editorContent.value = JSON.stringify(editableConfig, null, 2);
  parseError.value = null;
}

// Resize handlers
function handleMouseDown() {
  isDragging.value = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const newWidth = window.innerWidth - e.clientX;
  editorWidth.value = Math.max(MIN_EDITOR_WIDTH, newWidth);
  localStorage.setItem(EDITOR_WIDTH_KEY, editorWidth.value.toString());
}

function handleMouseUp() {
  isDragging.value = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

onMounted(() => {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});

const sectionKeys = Object.keys(sections) as SectionKey[];
</script>

<template>
  <div class="flex min-h-screen bg-neutral-900">
    <nav
      class="fixed w-[240px] h-screen p-4 border-r border-neutral-700 bg-neutral-900 overflow-y-auto z-10"
    >
      <img :src="spotrLogo" alt="Spotr" class="w-24 h-24 mb-2" />
      <h1 class="text-xl font-bold mb-6 text-neutral-100">spotr</h1>
      <h2 class="text-lg font-semibold mb-4 text-neutral-100">Examples</h2>
      <ul class="space-y-2">
        <li v-for="key in sectionKeys" :key="key">
          <button
            @click="setSection(key)"
            :class="[
              'text-left w-full text-neutral-400 hover:text-neutral-100',
              section === key ? 'font-bold text-neutral-100' : '',
            ]"
          >
            {{ sections[key].title }}
          </button>
        </li>
      </ul>
    </nav>

    <main class="ml-[240px] flex-1 flex">
      <ResultsPanel
        v-model="query"
        :section-config="sectionConfig"
        :spotr="spotrValue"
      />
      <ResizeHandle @mousedown="handleMouseDown" />
      <EditorPanel
        v-model="editorContent"
        :width="editorWidth"
        :parse-error="parseError"
        @reset="resetEditor"
      />
    </main>
  </div>
</template>

<style>
/* Global styles if needed */
</style>
