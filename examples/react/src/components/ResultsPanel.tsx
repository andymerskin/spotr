import { getNestedValue, formatCellValue } from '../../../shared/utils';
import type { Person, Game } from '../../../shared/spotr-config';

interface ResultsPanelProps {
  sectionConfig: {
    title: string;
    description: string;
    columns: string[];
    examples: string[];
  };
  query: string;
  onQueryChange: (query: string) => void;
  result: {
    results: Array<{ item: Person | Game; score: number | null }>;
    matchedKeywords: Array<{ name: string; terms: string[] }>;
    warnings: string[];
  };
}

export function ResultsPanel({ sectionConfig, query, onQueryChange, result }: ResultsPanelProps) {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-[960px]">
        <h1 className="text-2xl font-bold mb-2 text-neutral-100">{sectionConfig.title}</h1>
        <p className="text-neutral-400 mb-6">{sectionConfig.description}</p>

        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4 flex gap-2 flex-wrap">
          {sectionConfig.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => onQueryChange(ex)}
              className="px-3 py-1 text-sm bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600"
            >
              {ex}
            </button>
          ))}
        </div>

        {result.matchedKeywords.length > 0 && (
          <div className="mb-4 text-sm text-neutral-400">
            <span className="font-medium">Matched Keywords:</span>
            {result.matchedKeywords.map((k) => (
              <span key={k.name} className="keyword-highlight ml-2">
                {k.name} ({k.terms.join(', ')})
              </span>
            ))}
          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="mb-4 text-sm text-amber-400 bg-amber-900/30 p-2 rounded">
            <span className="font-medium">Warnings:</span>{' '}
            {[...new Set(result.warnings)].join('; ')}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-neutral-800 border border-neutral-700">
            <thead>
              <tr className="bg-neutral-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-300">Score</th>
                {sectionConfig.columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-sm font-medium text-neutral-300">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.results.map((r, i) => (
                <tr key={i} className="border-t border-neutral-700 hover:bg-neutral-700/50">
                  <td className="px-4 py-2 text-sm text-neutral-200">{r.score !== null ? r.score.toFixed(2) : '-'}</td>
                  {sectionConfig.columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm text-neutral-200">
                      {formatCellValue(getNestedValue(r.item, col)) as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
