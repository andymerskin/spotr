import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vue } from '@codemirror/lang-vue';
import { svelte } from '@replit/codemirror-lang-svelte';
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark';
import { frameworks } from '../data/examples';
import type { FrameworkId } from '../data/examples';

const snippets: Record<FrameworkId, string> = {
  react: `import { useState } from 'react';
import { useSpotr } from 'spotr/react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const spotr = useSpotr({
    collection: items,
    fields: [
      { name: 'title', weight: 1 },
      { name: 'description', weight: 0.7 },
    ],
  });
  
  const result = spotr.query(query);
  
  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {result.results.map((r) => (
          <li key={r.item.title}>{r.item.title}</li>
        ))}
      </ul>
    </>
  );
}`,
  vue: `<script setup>
import { ref, computed } from 'vue';
import { useSpotr } from 'spotr/vue';

const query = ref('');
const spotrRef = useSpotr({
  collection: items,
  fields: [
    { name: 'title', weight: 1 },
    { name: 'description', weight: 0.7 },
  ],
});

const result = computed(() => {
  return spotrRef.value?.query(query.value);
});
</script>

<template>
  <input v-model="query" />
  <ul>
    <li v-for="r in result.results" :key="r.item.title">
      {{ r.item.title }}
    </li>
  </ul>
</template>`,
  svelte: `<script>
import { writable, derived } from 'svelte/store';
import { createSpotr } from 'spotr/svelte';

const spotr = createSpotr({
  collection: items,
  fields: [
    { name: 'title', weight: 1 },
    { name: 'description', weight: 0.7 },
  ],
});

const query = writable('');
const results = derived([spotr, query], ([$spotr, $query]) =>
  $spotr.query($query)
);
</script>

<input bind:value={$query} />
<ul>
  {#each $results.results as r}
    <li>{r.item.title}</li>
  {/each}
</ul>`,
  solid: `import { createSignal, createMemo } from 'solid-js';
import { createSpotr } from 'spotr/solid';

function SearchComponent() {
  const spotr = createSpotr({
    collection: items,
    fields: [
      { name: 'title', weight: 1 },
      { name: 'description', weight: 0.7 },
    ],
  });
  
  const [query, setQuery] = createSignal('');
  const results = createMemo(() => spotr().query(query()));
  
  return (
    <>
      <input
        value={query()}
        onInput={(e) => setQuery(e.target.value)}
      />
      <ul>
        {results().results.map((r) => (
          <li>{r.item.title}</li>
        ))}
      </ul>
    </>
  );
}`,
  preact: `import { useState } from 'preact/hooks';
import { useSpotr } from 'spotr/preact';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const spotr = useSpotr({
    collection: items,
    fields: [
      { name: 'title', weight: 1 },
      { name: 'description', weight: 0.7 },
    ],
  });
  
  const result = spotr.query(query);
  
  return (
    <>
      <input
        value={query}
        onInput={(e) => setQuery(e.target.value)}
      />
      <ul>
        {result.results.map((r) => (
          <li key={r.item.title}>{r.item.title}</li>
        ))}
      </ul>
    </>
  );
}`,
};

export default function HeaderCodeExample() {
  const [selectedFramework, setSelectedFramework] =
    useState<FrameworkId>('react');
  const [mounted, setMounted] = useState(false);

  // CodeMirror uses useLayoutEffect; only render it on the client to avoid SSR warning/hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the appropriate language extension based on the selected framework
  const languageExtension = useMemo(() => {
    switch (selectedFramework) {
      case 'vue':
        return vue();
      case 'svelte':
        return svelte();
      case 'react':
      case 'preact':
      case 'solid':
      default:
        return javascript({ jsx: true, typescript: false });
    }
  }, [selectedFramework]);

  const extensions = useMemo(
    () => [languageExtension, EditorView.lineWrapping],
    [languageExtension]
  );

  return (
    <div className="w-[500px] max-w-full">
      {/* Framework tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {frameworks.map((framework) => (
          <button
            key={framework.id}
            onClick={() => setSelectedFramework(framework.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center cursor-pointer ${
              selectedFramework === framework.id
                ? 'bg-neutral-700 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            <Icon
              icon={framework.logo}
              className="mr-1.5 shrink-0"
              width={16}
              height={16}
            />
            {framework.name}
          </button>
        ))}
      </div>

      {/* CodeMirror box */}
      <div
        className="w-[500px] max-w-full overflow-hidden rounded-lg border border-neutral-700
          [&_.cm-editor]:w-[500px]! [&_.cm-editor]:max-w-full!
          [&_.cm-editor.cm-focused]:outline-none
          [&_.cm-scroller]:w-[500px]! [&_.cm-scroller]:max-w-full! [&_.cm-scroller]:overflow-x-hidden!
          [&_.cm-content]:w-[500px]! [&_.cm-content]:max-w-full!"
      >
        {mounted ? (
          <CodeMirror
            value={snippets[selectedFramework]}
            height="720px"
            theme={vsCodeDark}
            extensions={extensions}
            editable={false}
            readOnly={true}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: false,
              bracketMatching: false,
              closeBrackets: false,
              autocompletion: false,
              highlightSelectionMatches: false,
            }}
            className="text-sm"
            style={{ fontSize: '14px' }}
          />
        ) : null}
      </div>
    </div>
  );
}
