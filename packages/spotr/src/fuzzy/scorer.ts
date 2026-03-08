import { fuzzyScore } from './levenshtein';
import { getNestedValue } from '../utils/nested';
import { MAX_STRING_LENGTH } from '../types';
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
  normalizedTokens: string[],
  fields: NormalizedFieldConfig[],
  caseSensitive: boolean,
  maxStringLength: number = MAX_STRING_LENGTH
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

    let stringValue = String(value);

    // Normalize target once per field (truncate, collect warnings)
    if (stringValue.length > maxStringLength) {
      warnings.push(
        `Target string truncated from ${stringValue.length} to ${maxStringLength} characters for performance`
      );
      stringValue = stringValue.slice(0, maxStringLength);
    }
    const normalizedTarget = caseSensitive
      ? stringValue
      : stringValue.toLowerCase();

    let bestTokenScore = 0;
    for (const normalizedToken of normalizedTokens) {
      const score = fuzzyScore(
        normalizedToken,
        normalizedTarget,
        field.threshold
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
