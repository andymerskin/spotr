import { createMemo } from 'solid-js';
import { createSpotr } from 'spotr/solid';
import peopleData from './data/people.json';
import { getNestedValue, highlightCellValue } from './utils';
import './styles.css';

const title = 'Fields - Nested';
const columns = [
  'firstName',
  'lastName',
  'email',
  'address.city',
  'company.name',
];
const examples = ['los angeles', 'los angelas', 'acme', 'dunder'];
const LIMIT = 20;

export default function App() {
  const {
    query,
    setQuery,
    results: spotrResults,
  } = createSpotr({
    collection: peopleData,
    threshold: 0.3,
    fields: [
      { name: 'firstName', weight: 1 },
      { name: 'lastName', weight: 1 },
      { name: 'email', weight: 0.8 },
      { name: 'address.city', weight: 0.8 },
      { name: 'address.country', weight: 0.6 },
      { name: 'company.name', weight: 0.7 },
      { name: 'company.location.city', weight: 0.5 },
    ],
    limit: LIMIT,
  });

  const results = createMemo(() => {
    const q = query();
    if (!q.trim()) {
      return {
        results: peopleData
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
