import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSpotr, type SpotrOptions } from '../../../src/react';
import spotrLogo from '../../shared/spotr.svg';
import {
  extractEditableConfig,
  parseConfigWithHandlers,
  EDITOR_WIDTH_KEY,
  DEFAULT_EDITOR_WIDTH,
  MIN_EDITOR_WIDTH,
} from '../../shared/utils';
import { keywordHandlers, sections, type SectionKey, type Person, type Game } from '../../shared/spotr-config';
import { ResultsPanel } from './components/ResultsPanel';
import { ResizeHandle } from './components/ResizeHandle';
import { EditorPanel } from './components/EditorPanel';

function App() {
  const [section, setSection] = useState<SectionKey>('fields-basic');
  const [query, setQuery] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(() => {
    const saved = localStorage.getItem(EDITOR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_EDITOR_WIDTH;
  });
  
  const isDragging = useRef(false);
  const sectionConfig = sections[section];

  // Initialize editor content when section changes
  useEffect(() => {
    const editableConfig = extractEditableConfig(sectionConfig.config);
    setEditorContent(JSON.stringify(editableConfig, null, 2));
    setParseError(null);
  }, [section, sectionConfig.config]);

  // Parse editor content and merge with handlers
  const parsedConfig = useMemo(() => {
    try {
      const parsed = JSON.parse(editorContent);
      setParseError(null);
      
      // Merge with handlers from section defaults
      const merged = parseConfigWithHandlers(parsed, keywordHandlers[section]);
      return merged;
    } catch (e) {
      setParseError((e as Error).message);
      return null;
    }
  }, [editorContent, section]);

  const spotrConfig = useMemo(() => {
    const collection = sectionConfig.data as (Person | Game)[];
    if (!parsedConfig) {
      return {
        collection,
        ...sectionConfig.config,
      } as SpotrOptions<Person | Game>;
    }
    return {
      collection,
      ...parsedConfig,
    } as SpotrOptions<Person | Game>;
  }, [parsedConfig, sectionConfig.data, sectionConfig.config]);

  const spotr = useSpotr<Person | Game>(spotrConfig);

  const result = useMemo(() => {
    if (!query.trim()) {
      const limit = (spotrConfig.limit as number) || Infinity;
      return {
        results: (sectionConfig.data as (Person | Game)[]).slice(0, limit).map((item) => ({ item, score: null as number | null })),
        matchedKeywords: [],
        tokens: [],
        warnings: [],
      };
    }
    return spotr.query(query);
  }, [spotr, query, spotrConfig.limit, sectionConfig.data]);

  const handleEditorChange = useCallback((value: string) => {
    setEditorContent(value);
  }, []);

  const handleReset = useCallback(() => {
    const editableConfig = extractEditableConfig(sectionConfig.config);
    setEditorContent(JSON.stringify(editableConfig, null, 2));
    setParseError(null);
  }, [sectionConfig.config]);

  // Resize handle drag logic
  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(MIN_EDITOR_WIDTH, newWidth);
      setEditorWidth(clampedWidth);
      localStorage.setItem(EDITOR_WIDTH_KEY, clampedWidth.toString());
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-neutral-900">
      <nav className="fixed w-[240px] h-screen p-4 border-r border-neutral-700 bg-neutral-900 overflow-y-auto z-10">
        <img src={spotrLogo} alt="Spotr" className="w-24 h-24 mb-2" />
        <h1 className="text-xl font-bold mb-6 text-neutral-100">spotr</h1>
        <h2 className="text-lg font-semibold mb-4 text-neutral-100">Examples</h2>
        <ul className="space-y-2">
          {(Object.keys(sections) as SectionKey[]).map((key) => (
            <li key={key}>
              <button
                onClick={() => { setSection(key); setQuery(''); }}
                className={`text-left w-full text-neutral-400 hover:text-neutral-100 ${
                  section === key ? 'font-bold text-neutral-100' : ''
                }`}
              >
                {sections[key].title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="ml-[240px] flex-1 flex">
        <ResultsPanel
          sectionConfig={sectionConfig}
          query={query}
          onQueryChange={setQuery}
          result={result}
        />
        <ResizeHandle onMouseDown={handleMouseDown} />
        <EditorPanel
          value={editorContent}
          onChange={handleEditorChange}
          width={editorWidth}
          parseError={parseError}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}

export default App;
