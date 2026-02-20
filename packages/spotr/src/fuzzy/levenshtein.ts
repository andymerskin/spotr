import { MAX_STRING_LENGTH } from '../types';

/**
 * Calculates the Levenshtein distance (edit distance) between two strings.
 *
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to transform string `a`
 * into string `b`.
 *
 * Uses dynamic programming with a 2D matrix where matrix[i][j] represents
 * the minimum edit distance between the first i characters of `b` and the
 * first j characters of `a`.
 *
 * @param a - First string
 * @param b - Second string
 * @returns The Levenshtein distance between the two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  // Initialize the dynamic programming matrix
  // matrix[i][j] = edit distance between b[0..i-1] and a[0..j-1]
  const matrix: number[][] = [];

  // Initialize first column: transforming empty string to b[0..i-1] requires i insertions
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row: transforming a[0..j-1] to empty string requires j deletions
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix using dynamic programming
  // For each position, consider three possible operations:
  // 1. Substitution: matrix[i-1][j-1] + 1 (if characters differ)
  // 2. Insertion: matrix[i-1][j] + 1 (insert character from b)
  // 3. Deletion: matrix[i][j-1] + 1 (delete character from a)
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        // Characters match: no edit needed, carry forward previous distance
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Characters differ: take minimum of three edit operations
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution: replace a[j-1] with b[i-1]
          matrix[i][j - 1] + 1, // Deletion: delete a[j-1]
          matrix[i - 1][j] + 1 // Insertion: insert b[i-1] into a
        );
      }
    }
  }

  // Return the final distance (bottom-right corner of matrix)
  return matrix[b.length][a.length];
}

/**
 * Result of fuzzy scoring operation.
 */
export interface FuzzyScoreResult {
  /** Similarity score between 0 and 1, where 1 is a perfect match */
  score: number;
  /** Array of warning messages (e.g., string truncation warnings) */
  warnings: string[];
}

/**
 * Calculates a fuzzy similarity score between a query string and a target string.
 *
 * The scoring algorithm uses a tiered approach:
 * 1. Exact match: Returns score of 1.0
 * 2. Substring match: Returns score between 0.9-1.0 based on match ratio
 * 3. Levenshtein distance: Returns normalized similarity score (0-1)
 *
 * Scores below the threshold are returned as 0 to filter out poor matches.
 *
 * @param query - The search query string
 * @param target - The target string to match against
 * @param threshold - Minimum score threshold (default: 0.3). Scores below this return 0
 * @param caseSensitive - Whether comparison should be case-sensitive (default: false)
 * @param maxStringLength - Maximum string length before truncation (default: MAX_STRING_LENGTH)
 * @returns FuzzyScoreResult with score and any warnings
 */
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

  // Truncate query if it exceeds max length to prevent performance issues
  // Levenshtein distance calculation is O(n*m), so long strings can be slow
  if (q.length > maxStringLength) {
    warnings.push(
      `Query string truncated from ${q.length} to ${maxStringLength} characters for performance`
    );
    q = q.slice(0, maxStringLength);
  }

  // Truncate target if it exceeds max length
  if (t.length > maxStringLength) {
    warnings.push(
      `Target string truncated from ${t.length} to ${maxStringLength} characters for performance`
    );
    t = t.slice(0, maxStringLength);
  }

  // Normalize case if case-insensitive comparison is requested
  const normalizedQ = caseSensitive ? q : q.toLowerCase();
  const normalizedT = caseSensitive ? t : t.toLowerCase();

  // Exact match: perfect score
  if (normalizedQ === normalizedT) {
    return { score: 1, warnings };
  }

  // Empty string: no match possible
  if (normalizedQ.length === 0 || normalizedT.length === 0) {
    return { score: 0, warnings };
  }

  // Substring match: query is contained within target
  // Score ranges from 0.9 (short query in long target) to 1.0 (query equals target)
  // This gives substring matches a boost over pure Levenshtein distance
  if (normalizedT.includes(normalizedQ)) {
    return {
      score: 0.9 + (0.1 * normalizedQ.length) / normalizedT.length,
      warnings,
    };
  }

  // Calculate Levenshtein distance and convert to similarity score
  // Score = 1 - (distance / max_length)
  // This normalizes the distance to a 0-1 range where 1 is identical and 0 is completely different
  const distance = levenshteinDistance(normalizedQ, normalizedT);
  const maxLen = Math.max(normalizedQ.length, normalizedT.length);
  const score = 1 - distance / maxLen;

  // Apply threshold: return 0 if score is below threshold, otherwise return the score
  // This filters out poor matches early
  return {
    score: score >= threshold ? score : 0,
    warnings,
  };
}
