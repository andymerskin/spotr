import { useState, useMemo } from 'preact/hooks';
import { useSpotr } from 'spotr/preact';
import gamesData from './data/games.json';
import {
  getNestedValue,
  highlightCellValue,
} from './utils';
import type { Game } from './types';

const title = 'Keywords - Basic';
const columns = ['title', 'releaseYear', 'completed'];
const examples = ['witcher', 'done', 'ps5', 'nintendo'];

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);

const config = {
  collection: gamesData as Game[],
  threshold: 0.3,
  fields: [{ name: 'title', weight: 1 }],
  keywords: [
    { name: 'completed', triggers: ['done', 'complete', 'finished'], handler: completedHandler },
  ],
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
          <button onClick={() => setQuery(ex)} className="button">
            {ex}
          </button>
        ))}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="th">Score</th>
            {columns.map((col) => (
              <th className="th">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.results.map((r) => (
            <tr className="tr">
              <td className="td">{r.score != null ? r.score.toFixed(2) : '-'}</td>
              {columns.map((col) => (
                <td className="td">
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
