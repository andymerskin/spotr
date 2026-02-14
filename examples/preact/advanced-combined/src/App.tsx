import { useState, useMemo } from 'preact/hooks';
import { useSpotr } from 'spotr/preact';
import gamesData from './data/games.json';
import {
  getNestedValue,
  highlightCellValue,
} from './utils';
import type { Game } from './types';

const title = 'Advanced - Combined';
const columns = ['title', 'metadata.developer', 'metadata.publisher', 'completed'];
const examples = ['witcher', 'done', 'ps5', 'nintendo'];

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
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

const config = {
  collection: gamesData as Game[],
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
};

function App() {
  const [query, setQuery] = useState('');
  const spotr = useSpotr<Game>(config);

  const result = useMemo(() => {
    if (!query.trim()) {
      return {
        results: (gamesData as Game[]).slice(0, config.limit).map((item) => ({ item, score: null as number | null })),
        matchedKeywords: [] as { name: string; terms: string[] }[],
        tokens: [] as string[],
        warnings: [] as string[],
      };
    }
    return spotr.query(query);
  }, [spotr, query]);

  

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{title}</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        style={styles.input}
      />
      <div style={styles.buttons}>
        {examples.map((ex) => (
          <button  onClick={() => setQuery(ex)} style={styles.button}>
            {ex}
          </button>
        ))}
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Score</th>
            {columns.map((col) => (
              <th  style={styles.th}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.results.map((r, i) => (
            <tr  style={styles.tr}>
              <td style={styles.td}>{r.score != null ? r.score.toFixed(2) : '-'}</td>
              {columns.map((col) => (
                <td  style={styles.td}>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'sans-serif',
    maxWidth: 960,
    margin: '0 auto',
    padding: 16,
    backgroundColor: '#1a1a1a',
    color: '#e5e5e5',
    minHeight: '100vh',
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
  table: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '1px solid #444',
    backgroundColor: '#2a2a2a',
  },
  tr: { borderBottom: '1px solid #333' },
  td: { padding: '8px 12px' },
};

export default App;
