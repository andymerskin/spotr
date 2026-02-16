import { fuzzyScore } from './levenshtein';
import { getNestedValue } from '../utils/nested';
import type { FieldConfig, NormalizedFieldConfig } from '../types';

export function normalizeFieldConfig(
  fields: FieldConfig[],
  globalThreshold: number
): NormalizedFieldConfig[] {
  return fields.map((field) => {
    if (typeof field === 'string') {
      return { name: field, weight: 1, threshold: globalThreshold };
    }
    return {
      name: field.name,
      weight: field.weight ?? 1,
      threshold: field.threshold ?? globalThreshold,
    };
  });
}

export function scoreItem<T>(
  item: T,
  tokens: string[],
  fields: NormalizedFieldConfig[],
  caseSensitive: boolean
): { score: number; warnings: string[] } {
  let totalScore = 0;
  let totalWeight = 0;
  const warnings: string[] = [];

  for (const field of fields) {
    const value = getNestedValue(item, field.name);

    if (value == null) {
      if (field.name.includes('.')) {
        warnings.push(`Field "${field.name}" not found on item`);
      }
      continue;
    }

    const stringValue = String(value);

    let bestTokenScore = 0;
    for (const token of tokens) {
      const score = fuzzyScore(
        token,
        stringValue,
        field.threshold,
        caseSensitive
      );
      bestTokenScore = Math.max(bestTokenScore, score);
    }

    totalScore += bestTokenScore * field.weight;
    totalWeight += field.weight;
  }

  return {
    score: totalWeight > 0 ? totalScore / totalWeight : 0,
    warnings,
  };
}
