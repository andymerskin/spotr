import { useState, useMemo } from 'react';
import { useSpotr } from 'spotr/react';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';

const title = 'Advanced - Combined';
const columns = [
  'title',
  'metadata.developer',
  'metadata.publisher',
  'completed',
];
const textExamples = ['FromSoftware', 'FromSoftwere', 'nintendo', 'spider'];
const keywordExamples = ['done', 'sony', 'microsoft'];
const combinedExamples = ['FromSoftware done', 'spider sony'];

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
    mode: 'and' as const,
    definitions: [
      {
        name: 'completed',
        triggers: ['done', 'complete', 'finished'],
        handler: completedHandler,
      },
      {
        name: 'platform',
        triggers: [
          'ps4',
          'ps5',
          'xbox',
          'pc',
          'switch',
          'sony',
          'nintendo',
          'microsoft',
        ],
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
        results: (gamesData as Game[])
          .slice(0, config.limit)
          .map((item) => ({ item, score: null as number | null })),
        matchedKeywords: [] as { name: string; terms: string[] }[],
        tokens: [] as string[],
        warnings: [] as string[],
      };
    }
    return spotr.query(query);
  }, [spotr, query]);

  return (
    <div className="container">
      <h1 className="title">{title}</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="input"
      />
      <div className="example-groups">
        <div className="example-group">
          <span className="example-label">Try:</span>
          {textExamples.map((ex) => (
            <button key={ex} onClick={() => setQuery(ex)} className="button">
              {ex}
            </button>
          ))}
        </div>
        <div className="example-group">
          <span className="example-label">Keywords:</span>
          {keywordExamples.map((ex) => (
            <button key={ex} onClick={() => setQuery(ex)} className="button">
              {ex}
            </button>
          ))}
        </div>
        <div className="example-group">
          <span className="example-label">Combined:</span>
          {combinedExamples.map((ex) => (
            <button key={ex} onClick={() => setQuery(ex)} className="button">
              {ex}
            </button>
          ))}
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="th">Score</th>
            {columns.map((col) => (
              <th key={col} className="th">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.results.map((r, i) => (
            <tr key={i} className="tr">
              <td className="td">
                {r.score != null ? r.score.toFixed(2) : '-'}
              </td>
              {columns.map((col) => (
                <td key={col} className="td">
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
    </div>
  );
}

export default App;
