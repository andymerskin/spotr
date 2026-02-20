import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vue } from '@codemirror/lang-vue';
import { svelte } from '@replit/codemirror-lang-svelte';
import { oneDark } from '@codemirror/theme-one-dark';
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
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}`,
  vue: `import { ref, computed } from 'vue';
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
});`,
  svelte: `import { createSpotr } from 'spotr/svelte';

const { query, results } = createSpotr({
  collection: items,
  fields: [
    { name: 'title', weight: 1 },
    { name: 'description', weight: 0.7 },
  ],
});`,
  solid: `import { createSpotr } from 'spotr/solid';

const { query, setQuery, results } = createSpotr({
  collection: items,
  fields: [
    { name: 'title', weight: 1 },
    { name: 'description', weight: 0.7 },
  ],
});`,
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
    <input
      value={query}
      onInput={(e) => setQuery(e.target.value)}
    />
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
    () => [languageExtension, oneDark],
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

      {/* CodeMirror box - only render CodeMirror after mount to avoid useLayoutEffect SSR warning */}
      <div
        className="border border-neutral-700 rounded-lg overflow-hidden header-codemirror-container"
        style={{
          width: '500px',
          maxWidth: '100%',
          backgroundColor: 'transparent',
        }}
      >
        {mounted ? (
          <CodeMirror
            value={snippets[selectedFramework]}
            height="480px"
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
            style={{
              width: '500px',
              maxWidth: '100%',
              fontSize: '14px',
            }}
          />
        ) : (
          <div
            className="p-4 text-sm font-mono text-neutral-300 whitespace-pre overflow-auto"
            style={{
              height: '480px',
              width: '500px',
              maxWidth: '100%',
              fontSize: '14px',
            }}
          >
            {snippets[selectedFramework]}
          </div>
        )}
      </div>
    </div>
  );
}
