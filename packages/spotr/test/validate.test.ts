import { describe, it, expect } from 'vitest';
import {
  validateCollection,
  validateFields,
  validateKeywords,
  validateOptions,
} from '../src/utils/validate';
import { SpotrError, ErrorCodes } from '../src/errors';
import { MAX_STRING_LENGTH } from '../src/types';

const items = [{ id: 1 }, { id: 2 }];
const validFields = ['name'];
const validKeyword = {
  name: 'kw',
  triggers: ['x'],
  handler: () => [] as object[],
};

describe('validateCollection', () => {
  it('throws SpotrError with INVALID_COLLECTION for string', () => {
    try {
      validateCollection('invalid' as unknown);
      expect.fail('Expected SpotrError');
    } catch (e) {
      expect(e).toBeInstanceOf(SpotrError);
      expect((e as SpotrError).code).toBe(ErrorCodes.INVALID_COLLECTION);
    }
  });

  it('throws SpotrError with INVALID_COLLECTION for number', () => {
    try {
      validateCollection(123 as unknown);
      expect.fail('Expected SpotrError');
    } catch (e) {
      expect(e).toBeInstanceOf(SpotrError);
      expect((e as SpotrError).code).toBe(ErrorCodes.INVALID_COLLECTION);
    }
  });

  it('throws SpotrError with INVALID_COLLECTION for null', () => {
    expect(() => validateCollection(null as unknown)).toThrow(SpotrError);
  });

  it('throws SpotrError with INVALID_COLLECTION for plain object', () => {
    expect(() => validateCollection({} as unknown)).toThrow(SpotrError);
  });

  it('returns array unchanged for valid array input', () => {
    const result = validateCollection<{ id: number }>(items);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
  });

  it('converts Set to array for Set input', () => {
    const set = new Set(items);
    const result = validateCollection<{ id: number }>(set);
    expect(result).toEqual(items);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('validateFields', () => {
  it('throws for empty array', () => {
    try {
      validateFields([]);
      expect.fail('Expected SpotrError');
    } catch (e) {
      expect(e).toBeInstanceOf(SpotrError);
      expect((e as SpotrError).code).toBe(ErrorCodes.INVALID_FIELD_CONFIG);
    }
  });

  it('throws for non-array (undefined)', () => {
    expect(() => validateFields(undefined as never)).toThrow(SpotrError);
  });

  it('throws for non-array (string)', () => {
    expect(() => validateFields('fields' as never)).toThrow(SpotrError);
  });

  it('throws for fields[n] not string or object', () => {
    expect(() => validateFields([123 as unknown as { name: string }])).toThrow(
      SpotrError
    );
    expect(() => validateFields([123 as unknown as { name: string }])).toThrow(
      /fields\[0\] must be a string or object/
    );
  });

  it('throws for object field missing name', () => {
    expect(() =>
      validateFields([{ weight: 1 } as unknown as { name: string }])
    ).toThrow(SpotrError);
    expect(() =>
      validateFields([{ weight: 1 } as unknown as { name: string }])
    ).toThrow(/name is required/);
  });

  it('throws for object field with invalid weight (< 0)', () => {
    try {
      validateFields([{ name: 'x', weight: -0.1 }]);
      expect.fail('Expected SpotrError');
    } catch (e) {
      expect(e).toBeInstanceOf(SpotrError);
      expect((e as SpotrError).code).toBe(ErrorCodes.INVALID_FIELD_WEIGHT);
    }
  });

  it('throws for object field with invalid weight (> 1)', () => {
    expect(() => validateFields([{ name: 'x', weight: 1.5 }])).toThrow(
      SpotrError
    );
  });

  it('throws for object field with invalid weight (non-number)', () => {
    expect(() =>
      validateFields([{ name: 'x', weight: '1' as unknown as number }])
    ).toThrow(SpotrError);
  });

  it('throws for object field with invalid threshold (< 0)', () => {
    expect(() => validateFields([{ name: 'x', threshold: -0.1 }])).toThrow(
      SpotrError
    );
  });

  it('throws for object field with invalid threshold (> 1)', () => {
    expect(() => validateFields([{ name: 'x', threshold: 1.5 }])).toThrow(
      SpotrError
    );
  });

  it('accepts valid string fields', () => {
    expect(() => validateFields(['name', 'email'])).not.toThrow();
  });

  it('accepts valid object fields with optional weight and threshold', () => {
    expect(() =>
      validateFields([
        { name: 'a' },
        { name: 'b', weight: 0.5 },
        { name: 'c', threshold: 0.8 },
        { name: 'd', weight: 0.5, threshold: 0.9 },
      ])
    ).not.toThrow();
  });
});

describe('validateKeywords', () => {
  it('accepts array format and returns normalized with mode and', () => {
    const def = { ...validKeyword };
    const result = validateKeywords([def]);
    expect(result.mode).toBe('and');
    expect(result.definitions).toHaveLength(1);
    expect(result.definitions[0]).toBe(def);
  });

  it('accepts object format and preserves mode or', () => {
    const def = { ...validKeyword };
    const result = validateKeywords({ mode: 'or', definitions: [def] });
    expect(result.mode).toBe('or');
    expect(result.definitions).toHaveLength(1);
  });

  it('uses default mode and when mode omitted in object format', () => {
    const def = { ...validKeyword };
    const result = validateKeywords({ definitions: [def] });
    expect(result.mode).toBe('and');
  });

  it('throws for missing name', () => {
    try {
      validateKeywords([
        { triggers: ['x'], handler: () => [] } as unknown as {
          name: string;
          triggers: string[];
          handler: () => object[];
        },
      ]);
      expect.fail('Expected SpotrError');
    } catch (e) {
      expect(e).toBeInstanceOf(SpotrError);
      expect((e as SpotrError).code).toBe(ErrorCodes.INVALID_KEYWORD);
    }
  });

  it('throws for missing triggers', () => {
    expect(() =>
      validateKeywords([
        { name: 'x', handler: () => [] } as unknown as {
          name: string;
          triggers: string[];
          handler: () => object[];
        },
      ])
    ).toThrow(SpotrError);
  });

  it('throws for non-function handler', () => {
    expect(() =>
      validateKeywords([
        {
          name: 'x',
          triggers: ['x'],
          handler: 'fn' as unknown as () => object[],
        },
      ])
    ).toThrow(SpotrError);
    expect(() =>
      validateKeywords([
        {
          name: 'x',
          triggers: ['x'],
          handler: 'fn' as unknown as () => object[],
        },
      ])
    ).toThrow(/handler must be a function/);
  });
});

describe('validateOptions', () => {
  const baseOptions = {
    collection: items,
    fields: validFields,
  };

  it('throws for invalid threshold', () => {
    expect(() =>
      validateOptions({
        ...baseOptions,
        threshold: -0.1,
      })
    ).toThrow(SpotrError);
    expect(() =>
      validateOptions({
        ...baseOptions,
        threshold: 1.5,
      })
    ).toThrow(SpotrError);
  });

  it('throws for invalid limit', () => {
    expect(() =>
      validateOptions({
        ...baseOptions,
        limit: 0,
      })
    ).toThrow(SpotrError);
    expect(() =>
      validateOptions({
        ...baseOptions,
        limit: -1,
      })
    ).toThrow(SpotrError);
  });

  it('throws for invalid debounce', () => {
    expect(() =>
      validateOptions({
        ...baseOptions,
        debounce: -1,
      })
    ).toThrow(SpotrError);
  });

  it('returns correct defaults', () => {
    const result = validateOptions(baseOptions);
    expect(result.threshold).toBe(0.3);
    expect(result.limit).toBe(Infinity);
    expect(result.debounce).toBe(0);
    expect(result.caseSensitive).toBe(false);
    expect(result.minMatchCharLength).toBe(1);
    expect(result.maxStringLength).toBe(MAX_STRING_LENGTH);
    expect(result.collection).toEqual(items);
  });

  it('returns explicit values when provided', () => {
    const result = validateOptions({
      collection: items,
      fields: validFields,
      threshold: 0.5,
      limit: 10,
      debounce: 100,
      caseSensitive: true,
      minMatchCharLength: 2,
      maxStringLength: 500,
    });
    expect(result.threshold).toBe(0.5);
    expect(result.limit).toBe(10);
    expect(result.debounce).toBe(100);
    expect(result.caseSensitive).toBe(true);
    expect(result.minMatchCharLength).toBe(2);
    expect(result.maxStringLength).toBe(500);
  });

  describe('maxStringLength', () => {
    it('throws for maxStringLength of 0', () => {
      try {
        validateOptions({
          ...baseOptions,
          maxStringLength: 0,
        });
        expect.fail('Expected SpotrError');
      } catch (e) {
        expect(e).toBeInstanceOf(SpotrError);
        expect((e as SpotrError).code).toBe(
          ErrorCodes.INVALID_MAX_STRING_LENGTH
        );
      }
    });

    it('throws for negative maxStringLength', () => {
      try {
        validateOptions({
          ...baseOptions,
          maxStringLength: -100,
        });
        expect.fail('Expected SpotrError');
      } catch (e) {
        expect(e).toBeInstanceOf(SpotrError);
        expect((e as SpotrError).code).toBe(
          ErrorCodes.INVALID_MAX_STRING_LENGTH
        );
      }
    });

    it('throws for non-integer maxStringLength', () => {
      try {
        validateOptions({
          ...baseOptions,
          maxStringLength: 100.5,
        });
        expect.fail('Expected SpotrError');
      } catch (e) {
        expect(e).toBeInstanceOf(SpotrError);
        expect((e as SpotrError).code).toBe(
          ErrorCodes.INVALID_MAX_STRING_LENGTH
        );
      }
    });

    it('throws for non-number maxStringLength', () => {
      expect(() =>
        validateOptions({
          ...baseOptions,
          maxStringLength: '100' as unknown as number,
        })
      ).toThrow(SpotrError);
    });

    it('accepts valid positive integer maxStringLength', () => {
      const values = [1, 100, 1000, 5000, 10000];
      for (const val of values) {
        const result = validateOptions({
          ...baseOptions,
          maxStringLength: val,
        });
        expect(result.maxStringLength).toBe(val);
      }
    });
  });
});
