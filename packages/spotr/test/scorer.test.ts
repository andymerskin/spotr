import { describe, it, expect } from 'vitest';
import { normalizeFieldConfig, scoreItem } from '../src/fuzzy/scorer';

describe('normalizeFieldConfig', () => {
  it('converts string field to normalized config', () => {
    const result = normalizeFieldConfig(['name'], 0.3);
    expect(result).toEqual([{ name: 'name', weight: 1, threshold: 0.3 }]);
  });

  it('uses defaults for object field', () => {
    const result = normalizeFieldConfig([{ name: 'title' }], 0.3);
    expect(result).toEqual([{ name: 'title', weight: 1, threshold: 0.3 }]);
  });

  it('preserves explicit weight and threshold on object field', () => {
    const result = normalizeFieldConfig(
      [{ name: 'title', weight: 0.5, threshold: 0.8 }],
      0.3
    );
    expect(result).toEqual([{ name: 'title', weight: 0.5, threshold: 0.8 }]);
  });

  it('handles mixed string and object fields', () => {
    const result = normalizeFieldConfig(['a', { name: 'b', weight: 0.5 }], 0.4);
    expect(result).toEqual([
      { name: 'a', weight: 1, threshold: 0.4 },
      { name: 'b', weight: 0.5, threshold: 0.4 },
    ]);
  });
});

describe('scoreItem', () => {
  it('returns score 0 and no warnings for empty tokens', () => {
    const item = { name: 'hello' };
    const fields = [{ name: 'name', weight: 1, threshold: 0.3 }];
    const { score, warnings } = scoreItem(item, [], fields, false);
    expect(score).toBe(0);
    expect(warnings).toEqual([]);
  });

  it('returns score 0 for item with no matching fields', () => {
    const item = { name: 'hello' };
    const fields = [{ name: 'name', weight: 1, threshold: 0.3 }];
    const { score } = scoreItem(item, ['xyz'], fields, false);
    expect(score).toBe(0);
  });

  it('returns non-zero score for matching token', () => {
    const item = { name: 'hello' };
    const fields = [{ name: 'name', weight: 1, threshold: 0.3 }];
    const { score } = scoreItem(item, ['hello'], fields, false);
    expect(score).toBe(1);
  });

  it('applies field weights correctly', () => {
    const item = { a: 'hello', b: 'hello' };
    const fields = [
      { name: 'a', weight: 0.5, threshold: 0.3 },
      { name: 'b', weight: 1, threshold: 0.3 },
    ];
    const { score } = scoreItem(item, ['hello'], fields, false);
    // (1 * 0.5 + 1 * 1) / (0.5 + 1) = 1.5 / 1.5 = 1
    expect(score).toBe(1);
  });

  it('emits warning for missing nested path', () => {
    const item = { name: 'test' };
    const fields = [{ name: 'address.city', weight: 1, threshold: 0.3 }];
    const { score, warnings } = scoreItem(item, ['foo'], fields, false);
    expect(score).toBe(0);
    expect(warnings).toContain('Field "address.city" not found on item');
  });

  it('does not emit warning for simple missing field', () => {
    const item = { name: 'test' };
    const fields = [{ name: 'missing', weight: 1, threshold: 0.3 }];
    const { warnings } = scoreItem(item, ['foo'], fields, false);
    expect(warnings).toEqual([]);
  });

  it('respects caseSensitive', () => {
    const item = { name: 'hello' };
    const fields = [{ name: 'name', weight: 1, threshold: 0.3 }];
    const caseInsensitive = scoreItem(item, ['HELLO'], fields, false);
    const caseSensitive = scoreItem(item, ['HELLO'], fields, true);
    expect(caseInsensitive.score).toBe(1);
    expect(caseSensitive.score).toBe(0);
  });

  it('returns best token score per field (max across tokens)', () => {
    const item = { name: 'hello world' };
    const fields = [{ name: 'name', weight: 1, threshold: 0.3 }];
    // 'ell' and 'wor' both match - should use best
    const { score } = scoreItem(item, ['xyz', 'ell', 'wor'], fields, false);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns 0 when totalWeight is 0', () => {
    const item = { a: null, b: undefined };
    const fields = [
      { name: 'a', weight: 1, threshold: 0.3 },
      { name: 'b', weight: 1, threshold: 0.3 },
    ];
    const { score } = scoreItem(item, ['foo'], fields, false);
    expect(score).toBe(0);
  });

  it('scores nested field value', () => {
    const item = { address: { city: 'New York' } };
    const fields = [{ name: 'address.city', weight: 1, threshold: 0.3 }];
    const { score } = scoreItem(item, ['york'], fields, false);
    expect(score).toBeGreaterThan(0);
  });
});
