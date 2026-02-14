import { createSpotr } from 'spotr/solid';
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

const section = getSectionFromUrl();
const sec = SECTION_CONFIGS[section];
const { query, setQuery, results } = createSpotr({ collection: sec.data, ...sec.config } as import('../../../src/types').SpotrOptions<Person | Game>);

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
  table: { borderCollapse: 'collapse' as const, width: '100%' },
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
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{sec.title}</h1>
      <input
        type="text"
        value={query()}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        placeholder="Search..."
        style={styles.input}
      />
      <div style={styles.buttons}>
        {sec.examples.map((ex) => (
          <button onClick={() => setQuery(ex)} style={styles.button}>
            {ex}
          </button>
        ))}
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Score</th>
            {sec.columns.map((col) => (
              <th style={styles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results().results.map((item) => (
            <tr style={styles.tr}>
              <td style={styles.td}>
                {item.score != null ? item.score.toFixed(2) : '-'}
              </td>
              {sec.columns.map((col) => (
                <td style={styles.td}>
                  <span
                    innerHTML={highlightCellValue(
                      getNestedValue(item.item, col),
                      col,
                      results().matchedKeywords
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`.keyword-highlight { background: #fef08a; font-weight: bold; }`}</style>
    </div>
  );
}
