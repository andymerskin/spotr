import { MAX_STRING_LENGTH } from '../types';

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export interface FuzzyScoreResult {
  score: number;
  warnings: string[];
}

export function fuzzyScore(
  query: string,
  target: string,
  threshold: number = 0.3,
  caseSensitive: boolean = false,
  maxStringLength: number = MAX_STRING_LENGTH
): FuzzyScoreResult {
  const warnings: string[] = [];
  let q = query;
  let t = target;

  if (q.length > maxStringLength) {
    warnings.push(
      `Query string truncated from ${q.length} to ${maxStringLength} characters for performance`
    );
    q = q.slice(0, maxStringLength);
  }

  if (t.length > maxStringLength) {
    warnings.push(
      `Target string truncated from ${t.length} to ${maxStringLength} characters for performance`
    );
    t = t.slice(0, maxStringLength);
  }

  const normalizedQ = caseSensitive ? q : q.toLowerCase();
  const normalizedT = caseSensitive ? t : t.toLowerCase();

  if (normalizedQ === normalizedT) {
    return { score: 1, warnings };
  }
  if (normalizedQ.length === 0 || normalizedT.length === 0) {
    return { score: 0, warnings };
  }

  if (normalizedT.includes(normalizedQ)) {
    return {
      score: 0.9 + (0.1 * normalizedQ.length) / normalizedT.length,
      warnings,
    };
  }

  const distance = levenshteinDistance(normalizedQ, normalizedT);
  const maxLen = Math.max(normalizedQ.length, normalizedT.length);
  const score = 1 - distance / maxLen;

  return {
    score: score >= threshold ? score : 0,
    warnings,
  };
}
