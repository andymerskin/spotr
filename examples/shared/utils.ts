import type { MatchedKeyword } from '../../src/types';

// Get nested value using dot notation
export function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

// Format a value for table display
export function formatCellValue(val: unknown): string {
  if (val == null) return '-';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  if (
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  )
    return String(val);
  return String(val);
}

/**
 * Highlight keyword matches in a cell value. Returns HTML string with <mark class="keyword-highlight"> around matching text.
 * - For completed column: format true as "Done", wrap in mark when completed keyword matched
 * - For platforms (array): join with ", ", wrap matching platform strings when platform keyword matched
 * - Generic: wrap any term from matchedKeywords that appears in the stringified value (case-insensitive)
 */
export function highlightCellValue(
  value: unknown,
  columnKey: string,
  matchedKeywords: MatchedKeyword[]
): string {
  const HIGHLIGHT_CLASS = 'keyword-highlight';

  const wrapMatch = (text: string, term: string): string => {
    if (!text || !term) return text;
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    return text.replace(regex, `<mark class="${HIGHLIGHT_CLASS}">$1</mark>`);
  };

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // completed column: format as "Done" / "—", highlight "Done" when completed keyword matched
  if (columnKey === 'completed') {
    const display = value === true ? 'Done' : '—';
    const completedKw = matchedKeywords.find((k) => k.name === 'completed');
    if (completedKw && value === true) {
      return `<mark class="${HIGHLIGHT_CLASS}">${display}</mark>`;
    }
    return display;
  }

  // platforms (array): join with ", ", highlight matching platforms when platform keyword matched
  if (columnKey === 'platforms' && Array.isArray(value)) {
    const platformKw = matchedKeywords.find((k) => k.name === 'platform');
    const terms = platformKw?.terms ?? [];
    const joined = value
      .map((p: string) => {
        const str = String(p);
        const matchesTerm = terms.some((t) =>
          str.toLowerCase().includes(t.toLowerCase())
        );
        return matchesTerm
          ? `<mark class="${HIGHLIGHT_CLASS}">${str}</mark>`
          : str;
      })
      .join(', ');
    return joined || '-';
  }

  // Generic: wrap any matching terms in the stringified value
  const str = formatCellValue(value);
  if (!str || str === '-') return str;

  let result = str;
  for (const kw of matchedKeywords) {
    for (const term of kw.terms) {
      if (term && result.toLowerCase().includes(term.toLowerCase())) {
        result = wrapMatch(result, term);
      }
    }
  }
  return result;
}
