import { describe, it, expect } from 'vitest';
import {
  Spotr,
  SpotrError,
  ErrorCodes,
  type SpotrOptions,
  type SpotrResult,
  type ScoredResult,
  type MatchedKeyword,
  type FieldConfig,
  type KeywordsConfig,
  type KeywordDefinition,
  type NormalizedFieldConfig,
  type NormalizedKeywordsConfig,
} from '../src/index';

interface TestItem {
  name: string;
  value: number;
}

const testCollection: TestItem[] = [
  { name: 'test1', value: 1 },
  { name: 'test2', value: 2 },
];

describe('index exports', () => {
  describe('Spotr class', () => {
    it('should export Spotr class', () => {
      expect(Spotr).toBeDefined();
      expect(typeof Spotr).toBe('function');
    });

    it('should be instantiable', () => {
      const spotr = new Spotr({
        collection: testCollection,
        fields: ['name'],
      });
      expect(spotr).toBeInstanceOf(Spotr);
      expect(spotr).toHaveProperty('query');
      expect(typeof spotr.query).toBe('function');
    });
  });

  describe('SpotrError class', () => {
    it('should export SpotrError class', () => {
      expect(SpotrError).toBeDefined();
      expect(typeof SpotrError).toBe('function');
    });

    it('should be instantiable and extend Error', () => {
      const error = new SpotrError('Test error', ErrorCodes.INVALID_COLLECTION);
      expect(error).toBeInstanceOf(SpotrError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SpotrError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.INVALID_COLLECTION);
    });
  });

  describe('ErrorCodes', () => {
    it('should export ErrorCodes object', () => {
      expect(ErrorCodes).toBeDefined();
      expect(typeof ErrorCodes).toBe('object');
    });

    it('should contain all expected error code keys', () => {
      expect(ErrorCodes).toHaveProperty('INVALID_COLLECTION');
      expect(ErrorCodes).toHaveProperty('INVALID_FIELD_CONFIG');
      expect(ErrorCodes).toHaveProperty('INVALID_FIELD_WEIGHT');
      expect(ErrorCodes).toHaveProperty('INVALID_KEYWORD');
      expect(ErrorCodes).toHaveProperty('INVALID_HANDLER_RETURN');
    });

    it('should have string values for all error codes', () => {
      expect(typeof ErrorCodes.INVALID_COLLECTION).toBe('string');
      expect(typeof ErrorCodes.INVALID_FIELD_CONFIG).toBe('string');
      expect(typeof ErrorCodes.INVALID_FIELD_WEIGHT).toBe('string');
      expect(typeof ErrorCodes.INVALID_KEYWORD).toBe('string');
      expect(typeof ErrorCodes.INVALID_HANDLER_RETURN).toBe('string');
    });
  });

  describe('type exports', () => {
    it('should export all types and they should be usable', () => {
      // Type-only test - TypeScript will verify at compile time
      // If any type is missing or incorrectly exported, TypeScript will error
      const options: SpotrOptions<TestItem> = {
        collection: testCollection,
        fields: ['name'],
      };

      const result: SpotrResult<TestItem> = {
        results: [],
        matchedKeywords: [],
        tokens: [],
        warnings: [],
      };

      const scoredResult: ScoredResult<TestItem> = {
        item: testCollection[0],
        score: 1.0,
      };

      const matchedKeyword: MatchedKeyword = {
        name: 'test',
        terms: ['test'],
      };

      const fieldConfig: FieldConfig = 'name';

      const keywordDefinition: KeywordDefinition<TestItem> = {
        name: 'test',
        triggers: 'test',
        handler: (collection) => collection,
      };

      const keywordsConfig: KeywordsConfig<TestItem> = [keywordDefinition];

      const normalizedFieldConfig: NormalizedFieldConfig = {
        name: 'name',
        weight: 1,
        threshold: 0.5,
      };

      const normalizedKeywordsConfig: NormalizedKeywordsConfig = {
        mode: 'or',
        definitions: [],
      };

      // Verify types are accessible (compile-time check)
      expect(options).toBeDefined();
      expect(result).toBeDefined();
      expect(scoredResult).toBeDefined();
      expect(matchedKeyword).toBeDefined();
      expect(fieldConfig).toBeDefined();
      expect(keywordDefinition).toBeDefined();
      expect(keywordsConfig).toBeDefined();
      expect(normalizedFieldConfig).toBeDefined();
      expect(normalizedKeywordsConfig).toBeDefined();
    });
  });
});
