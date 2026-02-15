import { useState, useMemo } from 'react';
import { useSpotr } from 'spotr/react';

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: { city: string; country: string };
  company: { name: string; location?: { city: string } };
  subscribed: boolean;
}

interface Game {
  id: number;
  title: string;
  platforms: string[];
  releaseYear: number;
  completed: boolean;
  metadata: { developer: string; publisher: string };
}

interface Props {
  people: Person[];
  games: Game[];
}

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-neutral-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ClearIcon = () => (
  <svg
    className="w-5 h-5 text-neutral-400 hover:text-neutral-200"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function LandingSearchDemo({ people, games }: Props) {
  const [query, setQuery] = useState('');
  const [dataset, setDataset] = useState<'people' | 'games'>('people');

  const peopleConfig = useMemo(
    () => ({
      collection: people,
      threshold: 0.6,
      fields: [
        { name: 'firstName', weight: 1 },
        { name: 'lastName', weight: 1 },
        { name: 'email', weight: 0.7 },
      ],
      limit: 50,
    }),
    [people]
  );

  const gamesConfig = useMemo(
    () => ({
      collection: games,
      threshold: 0.6,
      fields: [
        { name: 'title', weight: 1 },
        { name: 'metadata.developer', weight: 0.9 },
      ],
      limit: 50,
    }),
    [games]
  );

  const peopleSpotr = useSpotr<Person>(peopleConfig);
  const gamesSpotr = useSpotr<Game>(gamesConfig);

  const result = useMemo(() => {
    const activeSpotr = dataset === 'people' ? peopleSpotr : gamesSpotr;
    const activeCollection = dataset === 'people' ? people : games;

    if (!query.trim()) {
      return {
        results: activeCollection.slice(0, 50).map((item) => ({
          item,
          score: null as number | null,
        })),
        matchedKeywords: [] as { name: string; terms: string[] }[],
        tokens: [] as string[],
        warnings: [] as string[],
      };
    }
    return activeSpotr.query(query);
  }, [query, dataset, peopleSpotr, gamesSpotr, people, games]);

  const formatCellValue = (val: unknown): string => {
    if (val == null) return '-';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search row: bar + toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder={`Search ${dataset}...`}
            className="w-full pl-11 pr-11 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-700 rounded transition-colors"
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Toggle */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setDataset('people')}
            className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
              dataset === 'people'
                ? 'bg-cyan-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            People
          </button>
          <button
            onClick={() => setDataset('games')}
            className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
              dataset === 'games'
                ? 'bg-cyan-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Games
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-neutral-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              {dataset === 'people' ? (
                <>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Company
                  </th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Platforms
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-200">
                    Developer
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {result.results.length === 0 ? (
              <tr>
                <td
                  colSpan={dataset === 'people' ? 6 : 6}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No results found
                </td>
              </tr>
            ) : (
              result.results.map((r: { item: Person | Game; score: number | null }) => (
                <tr
                  key={r.item.id}
                  className="bg-neutral-900 hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-neutral-300">
                    {r.score != null ? r.score.toFixed(2) : '-'}
                  </td>
                  {dataset === 'people' ? (
                    <>
                      <td className="px-4 py-3 text-sm text-neutral-200">
                        {(r.item as Person).firstName}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-200">
                        {(r.item as Person).lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Person).email}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Person).address.city}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Person).company.name}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-neutral-200">
                        {(r.item as Game).title}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Game).platforms.join(', ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Game).releaseYear}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Game).completed ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-300">
                        {(r.item as Game).metadata.developer}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
