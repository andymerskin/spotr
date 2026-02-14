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

export function fuzzyScore(
  query: string,
  target: string,
  threshold: number = 0.3,
  caseSensitive: boolean = false
): number {
  const q = caseSensitive ? query : query.toLowerCase();
  const t = caseSensitive ? target : target.toLowerCase();

  if (q === t) return 1;
  if (q.length === 0 || t.length === 0) return 0;

  if (t.includes(q)) {
    return 0.9 + (0.1 * q.length / t.length);
  }

  const distance = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const score = 1 - (distance / maxLen);

  return score >= threshold ? score : 0;
}
