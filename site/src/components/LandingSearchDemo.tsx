import { useState, useMemo, useEffect } from 'react';
import { useSpotr } from 'spotr/react';

function highlightMatches(
  text: string | number,
  tokens: string[]
): React.ReactNode {
  const textStr = String(text);

  // If no tokens, return plain text
  if (tokens.length === 0) {
    return textStr;
  }

  // Find all match ranges for each token (case-insensitive)
  const ranges: Array<[number, number]> = [];
  const textLower = textStr.toLowerCase();

  for (const token of tokens) {
    if (!token) continue; // Skip empty tokens

    const tokenLower = token.toLowerCase();
    let startIndex = 0;

    while (true) {
      const index = textLower.indexOf(tokenLower, startIndex);
      if (index === -1) break;

      ranges.push([index, index + token.length]);
      startIndex = index + 1;
    }
  }

  // If no matches found, return plain text
  if (ranges.length === 0) {
    return textStr;
  }

  // Sort ranges by start position
  ranges.sort((a, b) => a[0] - b[0]);

  // Merge overlapping or adjacent ranges
  const mergedRanges: Array<[number, number]> = [];
  let currentRange = ranges[0];

  for (let i = 1; i < ranges.length; i++) {
    const [start, end] = ranges[i];
    const [currentStart, currentEnd] = currentRange;

    // If ranges overlap or are adjacent, merge them
    if (start <= currentEnd) {
      currentRange = [currentStart, Math.max(currentEnd, end)];
    } else {
      mergedRanges.push(currentRange);
      currentRange = [start, end];
    }
  }
  mergedRanges.push(currentRange);

  // Build segments: plain text and highlighted text
  const segments: Array<{ text: string; highlight: boolean }> = [];
  let lastIndex = 0;

  for (const [start, end] of mergedRanges) {
    // Add plain text before this match
    if (start > lastIndex) {
      segments.push({
        text: textStr.slice(lastIndex, start),
        highlight: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: textStr.slice(start, end),
      highlight: true,
    });

    lastIndex = end;
  }

  // Add remaining plain text after last match
  if (lastIndex < textStr.length) {
    segments.push({
      text: textStr.slice(lastIndex),
      highlight: false,
    });
  }

  // Render segments
  return (
    <>
      {segments.map((segment, idx) =>
        segment.highlight ? (
          <span key={idx} className="bg-amber-300 text-black">
            {segment.text}
          </span>
        ) : (
          segment.text
        )
      )}
    </>
  );
}

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

const TH_CELL = 'px-4 py-3 text-left text-sm font-semibold text-neutral-200';
const TD_CELL = 'px-4 py-3 text-sm text-neutral-300';
const LIMIT = 50;

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

  // Clear search query when switching datasets
  useEffect(() => {
    setQuery('');
  }, [dataset]);

  // Extract unique platforms and years from games collection
  const gamePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    games.forEach((game) => {
      game.platforms.forEach((platform) => {
        platforms.add(platform.toLowerCase());
      });
    });
    return Array.from(platforms);
  }, [games]);

  const gameYears = useMemo(() => {
    const years = new Set<number>();
    games.forEach((game) => {
      years.add(game.releaseYear);
    });
    return Array.from(years)
      .sort((a, b) => b - a)
      .map(String);
  }, [games]);

  const peopleConfig = useMemo(
    () => ({
      collection: people,
      threshold: 0.3,
      fields: [
        { name: 'firstName', weight: 1 },
        { name: 'lastName', weight: 1 },
        { name: 'email', weight: 0.8 },
        { name: 'address.city', weight: 0.7 },
        { name: 'company.name', weight: 0.7 },
      ],
      keywords: [
        {
          name: 'subscribed',
          triggers: ['subscribed', 'subs'],
          handler: (collection: Person[]) =>
            collection.filter((item) => item.subscribed),
        },
      ],
      limit: LIMIT,
    }),
    [people]
  );

  const gamesConfig = useMemo(
    () => ({
      collection: games,
      threshold: 0.3,
      fields: [
        { name: 'title', weight: 1 },
        { name: 'metadata.developer', weight: 0.9 },
      ],
      keywords: [
        {
          name: 'completed',
          triggers: ['done', 'complete', 'finished'],
          handler: (collection: Game[]) =>
            collection.filter((item) => item.completed),
        },
        {
          name: 'platform',
          triggers: [...gamePlatforms, 'sony'],
          handler: (collection: Game[], terms?: string[]) =>
            collection.filter((item) =>
              (terms ?? []).some((t) => {
                const lowerT = t.toLowerCase();
                if (lowerT === 'sony') {
                  return item.platforms.some(
                    (p) =>
                      p.toLowerCase().includes('ps2') ||
                      p.toLowerCase().includes('ps3') ||
                      p.toLowerCase().includes('ps4') ||
                      p.toLowerCase().includes('ps5')
                  );
                }
                return item.platforms.some((p) =>
                  p.toLowerCase().includes(lowerT)
                );
              })
            ),
        },
        {
          name: 'year',
          triggers: gameYears,
          handler: (collection: Game[], terms?: string[]) =>
            collection.filter((item) =>
              (terms ?? []).some((t) => item.releaseYear === parseInt(t, 10))
            ),
        },
      ],
      limit: LIMIT,
    }),
    [games, gamePlatforms, gameYears]
  );

  const peopleSpotr = useSpotr(peopleConfig);
  const gamesSpotr = useSpotr(gamesConfig);

  const result = useMemo(() => {
    const activeSpotr = dataset === 'people' ? peopleSpotr : gamesSpotr;
    const activeCollection = dataset === 'people' ? people : games;

    if (!query.trim()) {
      const sorted =
        dataset === 'people'
          ? [...activeCollection].sort((a, b) =>
              a.firstName.localeCompare(b.firstName)
            )
          : [...activeCollection].sort((a, b) =>
              a.title.localeCompare(b.title)
            );
      return {
        results: sorted.slice(0, LIMIT).map((item) => ({
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

  const peopleTextExamples = ['alice', 'aloce', 'acme', 'los angeles'];
  const peopleKeywordExamples = ['subscribed'];
  const peopleCombinedExamples = ['alice subscribed'];
  const gamesTextExamples = ['witcher', 'spider', 'spoder', 'FromSoftware'];
  const gamesKeywordExamples = ['done', 'sony', 'xbox', '2020'];
  const gamesCombinedExamples = ['spider done'];

  const textExamples =
    dataset === 'people' ? peopleTextExamples : gamesTextExamples;
  const keywordExamples =
    dataset === 'people' ? peopleKeywordExamples : gamesKeywordExamples;
  const combinedExamples =
    dataset === 'people' ? peopleCombinedExamples : gamesCombinedExamples;
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder={`Search ${dataset}...`}
            className="w-full pl-11 pr-11 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-700 rounded transition-colors cursor-pointer"
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

      {/* Example queries: text and keywords */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center mt-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-neutral-500 self-center mr-1">
            Try:
          </span>
          {textExamples.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-neutral-500 self-center mr-1">
            Keywords:
          </span>
          {keywordExamples.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-neutral-500 self-center mr-1">
            Combined:
          </span>
          {combinedExamples.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-neutral-700 rounded-lg mt-6 min-h-[450px]">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              {dataset === 'people' ? (
                <>
                  <th className={TH_CELL}>Score</th>
                  <th className={TH_CELL}>First Name</th>
                  <th className={TH_CELL}>Last Name</th>
                  <th className={TH_CELL}>Email</th>
                  <th className={TH_CELL}>City</th>
                  <th className={TH_CELL}>Company</th>
                  <th className={TH_CELL}>Subscribed</th>
                </>
              ) : (
                <>
                  <th className={TH_CELL}>Score</th>
                  <th className={TH_CELL}>Title</th>
                  <th className={TH_CELL}>Developer</th>
                  <th className={TH_CELL}>Year</th>
                  <th className={TH_CELL}>Platforms</th>
                  <th className={TH_CELL}>Completed</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {result.results.length === 0 ? (
              <tr>
                <td
                  colSpan={dataset === 'people' ? 7 : 6}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No results found
                </td>
              </tr>
            ) : (
              result.results.map(
                (r: { item: Person | Game; score: number | null }) => (
                  <tr
                    key={r.item.id}
                    className="bg-neutral-900 hover:bg-neutral-800 transition-colors"
                  >
                    <td className={TD_CELL}>
                      {r.score != null ? r.score.toFixed(2) : '-'}
                    </td>
                    {dataset === 'people' ? (
                      <>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Person).firstName,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Person).lastName,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Person).email,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Person).address.city,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Person).company.name,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {(r.item as Person).subscribed ? '✅' : '❌'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Game).title,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Game).metadata.developer,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Game).releaseYear,
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {highlightMatches(
                            (r.item as Game).platforms.join(', '),
                            result.tokens
                          )}
                        </td>
                        <td className={TD_CELL}>
                          {(r.item as Game).completed ? '✅' : '❌'}
                        </td>
                      </>
                    )}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
