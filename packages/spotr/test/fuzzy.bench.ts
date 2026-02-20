import { bench, describe } from 'vitest';
import { levenshteinDistance, fuzzyScore } from '../src/fuzzy/levenshtein';
import { scoreItem } from '../src/fuzzy/scorer';
import type { NormalizedFieldConfig } from '../src/types';

describe('levenshteinDistance', () => {
  bench('short strings', () => {
    levenshteinDistance('hello', 'hallo');
  });

  bench('medium strings', () => {
    levenshteinDistance('kitten', 'sitting');
  });

  bench('longer strings', () => {
    levenshteinDistance(
      'supercalifragilisticexpialidocious',
      'supercalifragilistic'
    );
  });
});

describe('fuzzyScore', () => {
  bench('exact match', () => {
    fuzzyScore('hello', 'hello');
  });

  bench('partial match', () => {
    fuzzyScore('ell', 'hello');
  });

  bench('fuzzy match', () => {
    fuzzyScore('hl', 'hello');
  });
});

describe('scoreItem', () => {
  const item = { name: 'John Doe', email: 'john@example.com' };
  const tokens = ['john', 'doe'];
  const fields: NormalizedFieldConfig[] = [
    { name: 'name', weight: 1, threshold: 0.3 },
    { name: 'email', weight: 1, threshold: 0.3 },
  ];

  bench('single item', () => {
    scoreItem(item, tokens, fields, false);
  });
});
