import { useState, useMemo } from 'preact/hooks';
import { useSpotr } from 'spotr/preact';
import peopleData from './data/people.json';
import { getNestedValue, highlightCellValue } from './utils';

const title = 'Fields - Basic';
const columns = ['firstName', 'lastName', 'email'];
const examples = ['alice', 'aloce', 'wayne', 'acme.com'];
const LIMIT = 20;

function App() {
  const [query, setQuery] = useState('');
  const spotr = useSpotr({
    collection: peopleData,
    threshold: 0.3,
    fields: [
      { name: 'firstName', weight: 1 },
      { name: 'lastName', weight: 1 },
      { name: 'email', weight: 0.8 },
    ],
    limit: LIMIT,
  });

  const result = useMemo(() => {
    if (!query.trim()) {
      return {
        results: peopleData
          .slice(0, LIMIT)
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
              <th className="th">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.results.map((r) => (
            <tr className="tr">
              <td className="td">
                {r.score != null ? r.score.toFixed(2) : '-'}
              </td>
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
