import { createMemo } from 'solid-js';
import { createSpotr } from 'spotr/solid';
import peopleData from './data/people.json';
import {
  getNestedValue,
  highlightCellValue,
} from './utils';
import type { Person } from './types';
import './App.css';

const title = 'Fields - Basic';
const columns = ['firstName', 'lastName', 'email'];
const examples = ['alice', 'johnson', 'acme', 'usa'];

const config = {
  collection: peopleData as Person[],
  threshold: 0.3,
  fields: [
    { name: 'firstName', weight: 1 },
    { name: 'lastName', weight: 1 },
    { name: 'email', weight: 0.7 },
  ],
  limit: 20,
};

export default function App() {
  const { query, setQuery, results: spotrResults } = createSpotr(config);
  

  const results = createMemo(() => {
  const q = query();
  if (!q.trim()) {
    return {
      results: (peopleData as Person[]).slice(0, config.limit).map((item) => ({ item, score: null as number | null })),
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
          <button  onClick={() => setQuery(ex)} class="button">
            {ex}
          </button>
        ))}
      </div>
      <table class="table">
        <thead>
          <tr>
            <th class="th">Score</th>
            {columns.map((col) => (
              <th  class="th">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results().results.map((item) => (
            <tr  class="tr">
              <td class="td">{item.score != null ? item.score.toFixed(2) : '-'}</td>
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