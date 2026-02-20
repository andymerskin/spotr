import { createMemo } from 'solid-js';
import { createSpotr } from 'spotr/solid';
import gamesJson from './data/games.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Game } from './types';
import './styles.css';

const gamesData: Game[] = gamesJson as Game[];

const title = 'Keywords - Advanced';
const columns = [
  'title',
  'metadata.developer',
  'releaseYear',
  'platforms',
  'completed',
];
const textExamples = ['witcher', 'spider', 'zelda'];
const keywordExamples = ['done', 'ps5', 'xbox', 'recent'];
const LIMIT = 20;

const completedHandler = (col: Game[]) => col.filter((i) => i.completed);
const platformHandler = (col: Game[], terms?: string[]) =>
  col.filter((i) =>
    (terms ?? []).some((t) =>
      i.platforms.some((p) => p.toLowerCase().includes(t))
    )
  );
const recentHandler = (col: Game[]) => col.filter((i) => i.releaseYear >= 2020);

export default function App() {
  const {
    query,
    setQuery,
    results: spotrResults,
  } = createSpotr({
    collection: gamesData,
    threshold: 0.3,
    fields: [
      { name: 'title', weight: 1 },
      { name: 'metadata.developer', weight: 0.9 },
    ],
    keywords: {
      mode: 'and',
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
    limit: LIMIT,
  });

  const results = createMemo(() => {
    const q = query();
    if (!q.trim()) {
      return {
        results: gamesData
          .slice(0, LIMIT)
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
      <div class="example-groups">
        <div class="example-group">
          <span class="example-label">Try:</span>
          {textExamples.map((ex) => (
            <button onClick={() => setQuery(ex)} class="button">
              {ex}
            </button>
          ))}
        </div>
        <div class="example-group">
          <span class="example-label">Keywords:</span>
          {keywordExamples.map((ex) => (
            <button onClick={() => setQuery(ex)} class="button">
              {ex}
            </button>
          ))}
        </div>
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
