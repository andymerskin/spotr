import { useState, useMemo } from 'preact/hooks';
import { useSpotr } from 'spotr/preact';
import peopleData from './data/people.json';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Person, Game } from './types';

type SectionKey =
  | 'fields-basic'
  | 'fields-nested'
  | 'keywords-basic'
  | 'keywords-advanced'
  | 'advanced-combined';

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) => i.platforms.some((p) => p.toLowerCase().includes(t)))
  );
const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);
const platformAdvancedHandler = (col: Game[], terms?: string[]) => {
  const map: Record<string, string[]> = {
    sony: ['ps4', 'ps5'],
    nintendo: ['switch', 'wii'],
    microsoft: ['xbox'],
  };
  const expanded = (terms ?? []).flatMap((t) => map[t.toLowerCase()] ?? [t]);
  return col.filter((i) =>
    expanded.some((t) => i.platforms.some((p) => p.toLowerCase().includes(t)))
  );
};

const SECTION_CONFIGS: Record<
  SectionKey,
  {
    title: string;
    data: Person[] | Game[];
    config: {
      threshold: number;
      fields: { name: string; weight: number }[];
      keywords?: unknown;
      limit: number;
    };
    columns: string[];
    examples: string[];
  }
> = {
  'fields-basic': {
    title: 'Fields - Basic',
    data: peopleData as Person[],
    config: {
      threshold: 0.3,
      fields: [
        { name: 'firstName', weight: 1 },
        { name: 'lastName', weight: 1 },
        { name: 'email', weight: 0.7 },
      ],
      limit: 20,
    },
    columns: ['firstName', 'lastName', 'email'],
    examples: ['alice', 'johnson', 'acme', 'usa'],
  },
  'fields-nested': {
    title: 'Fields - Nested',
    data: peopleData as Person[],
    config: {
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
    },
    columns: ['firstName', 'lastName', 'address.city', 'company.name'],
    examples: ['alice', 'johnson', 'acme', 'usa'],
  },
  'keywords-basic': {
    title: 'Keywords - Basic',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [{ name: 'title', weight: 1 }],
      keywords: [
        { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
      ],
      limit: 20,
    },
    columns: ['title', 'releaseYear', 'completed'],
    examples: ['witcher', 'done', 'ps5', 'nintendo'],
  },
  'keywords-advanced': {
    title: 'Keywords - Advanced',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [{ name: 'title', weight: 1 }],
      keywords: {
        mode: 'and',
        definitions: [
          { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
          { name: 'platform', triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'], handler: platformHandler },
          { name: 'recent', triggers: ['recent', 'new'], handler: recentHandler },
        ],
      },
      limit: 20,
    },
    columns: ['title', 'platforms', 'releaseYear', 'completed'],
    examples: ['witcher', 'done', 'ps5', 'nintendo'],
  },
  'advanced-combined': {
    title: 'Advanced - Combined',
    data: gamesData as Game[],
    config: {
      threshold: 0.3,
      fields: [
        { name: 'title', weight: 1 },
        { name: 'metadata.developer', weight: 0.8 },
        { name: 'metadata.publisher', weight: 0.6 },
      ],
      keywords: {
        mode: 'and',
        definitions: [
          { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
          {
            name: 'platform',
            triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch', 'sony', 'nintendo', 'microsoft'],
            handler: platformAdvancedHandler,
          },
        ],
      },
      limit: 20,
    },
    columns: ['title', 'metadata.developer', 'metadata.publisher', 'completed'],
    examples: ['witcher', 'done', 'ps5', 'nintendo'],
  },
};

function getSectionFromUrl(): SectionKey {
  const params = new URLSearchParams(window.location.search);
  const ex = params.get('example');
  if (ex && ex in SECTION_CONFIGS) return ex as SectionKey;
  return 'fields-basic';
}

const styles: Record<string, Record<string, string | number>> = {
  container: {
    fontFamily: 'sans-serif',
    padding: 16,
    backgroundColor: '#1a1a1a',
    color: '#e5e5e5',
    minHeight: '100vh',
    maxWidth: 960,
    margin: '0 auto',
  },
  title: { fontSize: 24, marginBottom: 16 },
  input: {
    width: '100%',
    maxWidth: 400,
    padding: '8px 12px',
    marginBottom: 12,
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    color: '#e5e5e5',
    borderRadius: 4,
  },
  buttons: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  button: {
    padding: '4px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    color: '#e5e5e5',
    borderRadius: 4,
    cursor: 'pointer',
  },
  table: { borderCollapse: 'collapse', width: '100%' },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '1px solid #444',
    backgroundColor: '#2a2a2a',
  },
  tr: { borderBottom: '1px solid #333' },
  td: { padding: '8px 12px' },
};

export default function App() {
  const [section] = useState<SectionKey>(getSectionFromUrl);
  const [query, setQuery] = useState('');

  const sec = SECTION_CONFIGS[section];
  const spotrConfig = useMemo(
    () => ({ collection: sec.data, ...sec.config }) as import('../../../src/types').SpotrOptions<Person | Game>,
    [section, sec]
  );
  const spotr = useSpotr<Person | Game>(spotrConfig);

  const result = useMemo(() => {
    if (!query.trim()) {
      const limit = sec.config.limit;
      return {
        results: (sec.data as (Person | Game)[])
          .slice(0, limit)
          .map((item) => ({ item, score: null as number | null })),
        matchedKeywords: [] as { name: string; terms: string[] }[],
        tokens: [] as string[],
        warnings: [] as string[],
      };
    }
    return spotr.query(query);
  }, [spotr, query, sec]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{sec.title}</h1>
      <input
        type="search"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        placeholder="Search..."
        style={styles.input}
      />
      <div style={styles.buttons}>
        {sec.examples.map((ex) => (
          <button key={ex} onClick={() => setQuery(ex)} style={styles.button}>
            {ex}
          </button>
        ))}
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Score</th>
            {sec.columns.map((col) => (
              <th key={col} style={styles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.results.map((r, i) => (
            <tr key={i} style={styles.tr}>
              <td style={styles.td}>{r.score != null ? r.score.toFixed(2) : '-'}</td>
              {sec.columns.map((col) => (
                <td key={col} style={styles.td}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightCellValue(
                        getNestedValue(r.item, col),
                        col,
                        result.matchedKeywords
                      ),
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .keyword-highlight { background: #fef08a; font-weight: bold; }
        input[type="search"]::-webkit-search-cancel-button {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23e5e5e5' d='M8 6.586L11.414 3.172l1.414 1.414L9.414 8l3.414 3.414-1.414 1.414L8 9.414l-3.414 3.414-1.414-1.414L6.586 8 3.172 4.586l1.414-1.414L8 6.586z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          cursor: pointer;
          opacity: 0.7;
        }
        input[type="search"]::-webkit-search-cancel-button:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
