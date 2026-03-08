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
 * Calculates a fuzzy similarity score between two pre-normalized strings.
 * Callers must truncate and apply case normalization before calling.
 *
 * The scoring algorithm uses a tiered approach:
 * 1. Exact match: Returns score of 1.0
 * 2. Substring match: Returns score between 0.9-1.0 based on match ratio
 * 3. Levenshtein distance: Returns normalized similarity score (0-1)
 *
 * Scores below the threshold are returned as 0 to filter out poor matches.
 *
 * @param normalizedQuery - Pre-normalized query string (truncated, case-adjusted)
 * @param normalizedTarget - Pre-normalized target string (truncated, case-adjusted)
 * @param threshold - Minimum score threshold. Scores below this return 0
 * @returns Similarity score between 0 and 1
 */
export function fuzzyScore(
  normalizedQuery: string,
  normalizedTarget: string,
  threshold: number = 0.3
): number {
  // Exact match: perfect score
  if (normalizedQuery === normalizedTarget) {
    return 1;
  }

  // Empty string: no match possible
  if (normalizedQuery.length === 0 || normalizedTarget.length === 0) {
    return 0;
  }

  // Substring match: query is contained within target
  // Score ranges from 0.9 (short query in long target) to 1.0 (query equals target)
  if (normalizedTarget.includes(normalizedQuery)) {
    return 0.9 + (0.1 * normalizedQuery.length) / normalizedTarget.length;
  }

  // Calculate Levenshtein distance and convert to similarity score
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
  const maxLen = Math.max(normalizedQuery.length, normalizedTarget.length);
  const score = 1 - distance / maxLen;

  return score >= threshold ? score : 0;
}
