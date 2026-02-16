import { createMemo } from 'solid-js';
import { createSpotr } from 'spotr/solid';
import gamesData from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';
import './styles.css';

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

export default function App() {
  const { query, setQuery, results: spotrResults } = createSpotr(config);

  const results = createMemo(() => {
    const q = query();
    if (!q.trim()) {
      return {
        results: (gamesData as Game[])
          .slice(0, config.limit)
          .map((item) => ({ item, score: null as number | null })),
        matchedKeywords: [] as { name: string; terms: string[] }[],
        tokens: [] as string[],
        warnings: [] as string[],
      };
    }
    return spotrResults();
  });

  return (
    <div class="container">
      <h1 class="title">{title}</h1>
      <input
        type="search"
        value={query()}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        placeholder="Search..."
        class="input"
      />
      <div class="buttons">
        {examples.map((ex) => (
          <button onClick={() => setQuery(ex)} class="button">
            {ex}
          </button>
        ))}
      </div>
      <table class="table">
        <thead>
          <tr>
            <th class="th">Score</th>
            {columns.map((col) => (
              <th class="th">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results().results.map((item) => (
            <tr class="tr">
              <td class="td">
                {item.score != null ? item.score.toFixed(2) : '-'}
              </td>
              {columns.map((col) => (
                <td class="td">
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
    </div>
  );
}
