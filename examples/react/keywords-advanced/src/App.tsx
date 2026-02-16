import { useState, useMemo, useCallback } from 'react';
import { useSpotr } from 'spotr/react';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';

const title = 'Keywords - Advanced';
const columns = ['title', 'platforms', 'releaseYear', 'completed'];
const examples = ['witcher', 'done', 'ps5', 'nintendo'];

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) =>
      i.platforms.some((p) => p.toLowerCase().includes(t))
    )
  );
const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);

const config = {
  collection: gamesData as Game[],
  threshold: 0.3,
  fields: [{ name: 'title', weight: 1 }],
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
        triggers: ['ps4', 'ps5', 'xbox', 'pc', 'switch'],
        handler: platformHandler,
      },
      { name: 'recent', triggers: ['recent', 'new'], handler: recentHandler },
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

  const setExample = useCallback((ex: string) => setQuery(ex), []);

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
      <div className="buttons">
        {examples.map((ex) => (
          <button key={ex} onClick={() => setExample(ex)} className="button">
            {ex}
          </button>
        ))}
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
