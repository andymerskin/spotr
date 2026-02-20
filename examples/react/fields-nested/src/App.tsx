import { useState, useMemo } from 'react';
import { useSpotr } from 'spotr/react';
import peopleData from './data/people.json';
import { getNestedValue, highlightCellValue } from './utils';
import type { Person } from './types';

const title = 'Fields - Nested';
const columns = ['firstName', 'lastName', 'address.city', 'company.name'];
const examples = ['los angeles', 'los angelas', 'acme', 'dunder'];

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

function App() {
  const [query, setQuery] = useState('');
  const spotr = useSpotr<Person>(config);

  const result = useMemo(() => {
    if (!query.trim()) {
      return {
        results: (peopleData as Person[])
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
      <div className="buttons">
        {examples.map((ex) => (
          <button key={ex} onClick={() => setQuery(ex)} className="button">
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
