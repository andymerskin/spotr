import { createMemo } from 'solid-js';
import { createSpotr } from 'spotr/solid';
import peopleData from './data/people.json';
import {
  getNestedValue,
  highlightCellValue,
} from './utils';
import type { Person } from './types';

const title = 'Fields - Nested';
const columns = ['firstName', 'lastName', 'address.city', 'company.name'];
const examples = ['alice', 'johnson', 'acme', 'usa'];

const config = {
  collection: peopleData as Person[],
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
                <td  class="td">
                  <span
                    innerHTML={}
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

<style>
  .container {
    font-family: sans-serif;
    padding: 16px;
    background-color: #1a1a1a;
    color: #e5e5e5;
    min-height: 100vh;
    max-width: 960px;
    margin: 0 auto;
  }
  .title {
    font-size: 24px;
    margin-bottom: 16px;
  }
  .input {
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    margin-bottom: 12px;
    background-color: #2a2a2a;
    border: 1px solid #444;
    color: #e5e5e5;
    border-radius: 4px;
  }
  .buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .button {
    padding: 4px 12px;
    background-color: #2a2a2a;
    border: 1px solid #444;
    color: #e5e5e5;
    border-radius: 4px;
    cursor: pointer;
  }
  .table {
    border-collapse: collapse;
    width: 100%;
  }
  .th {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid #444;
    background-color: #2a2a2a;
  }
  .tr {
    border-bottom: 1px solid #333;
  }
  .td {
    padding: 8px 12px;
  }
  :global(.keyword-highlight) {
    background: #fef08a;
    font-weight: bold;
  }
  .input::-webkit-search-cancel-button {
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
  .input::-webkit-search-cancel-button:hover {
    opacity: 1;
  }
</style>