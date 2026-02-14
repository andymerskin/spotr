import { SpotrError, ErrorCodes } from '../errors';
import type { SpotrOptions, FieldConfig, KeywordsConfig, KeywordDefinition, NormalizedKeywordsConfig } from '../types';

export function validateCollection<T>(collection: unknown): T[] {
  if (!Array.isArray(collection) && !(collection instanceof Set)) {
    throw new SpotrError(
      `collection must be an Array or Set, received ${typeof collection}`,
      ErrorCodes.INVALID_COLLECTION
    );
  }
  return (collection instanceof Set ? Array.from(collection) : collection) as T[];
}

export function validateFields(fields: FieldConfig[]): void {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new SpotrError(
      'fields must be a non-empty array',
      ErrorCodes.INVALID_FIELD_CONFIG
    );
  }

  for (const [index, field] of fields.entries()) {
    if (typeof field === 'string') continue;

    if (typeof field !== 'object' || field === null) {
      throw new SpotrError(
        `fields[${index}] must be a string or object`,
        ErrorCodes.INVALID_FIELD_CONFIG
      );
    }

    if (!field.name || typeof field.name !== 'string') {
      throw new SpotrError(
        `fields[${index}].name is required and must be a string`,
        ErrorCodes.INVALID_FIELD_CONFIG
      );
    }

    if (field.weight !== undefined) {
      if (typeof field.weight !== 'number' || field.weight < 0 || field.weight > 1) {
        throw new SpotrError(
          `fields.${field.name}.weight must be between 0 and 1, received ${field.weight}`,
          ErrorCodes.INVALID_FIELD_WEIGHT
        );
      }
    }

    if (field.threshold !== undefined) {
      if (typeof field.threshold !== 'number' || field.threshold < 0 || field.threshold > 1) {
        throw new SpotrError(
          `fields.${field.name}.threshold must be between 0 and 1, received ${field.threshold}`,
          ErrorCodes.INVALID_FIELD_CONFIG
        );
      }
    }
  }
}

export function validateKeywords<T>(keywords: KeywordsConfig<T>): NormalizedKeywordsConfig {
  const normalized: NormalizedKeywordsConfig = {
    mode: 'and',
    definitions: [],
  };

  if (Array.isArray(keywords)) {
    normalized.definitions = keywords as KeywordDefinition<unknown>[];
  } else {
    normalized.mode = keywords.mode ?? 'and';
    normalized.definitions = keywords.definitions as KeywordDefinition<unknown>[];
  }

  for (const [index, def] of normalized.definitions.entries()) {
    if (!def.name) {
      throw new SpotrError(
        `keywords[${index}].name is required`,
        ErrorCodes.INVALID_KEYWORD
      );
    }
    if (!def.triggers) {
      throw new SpotrError(
        `keywords[${index}].triggers is required`,
        ErrorCodes.INVALID_KEYWORD
      );
    }
    if (typeof def.handler !== 'function') {
      throw new SpotrError(
        `keywords[${index}].handler must be a function`,
        ErrorCodes.INVALID_KEYWORD
      );
    }
  }

  return normalized;
}

export function validateOptions<T extends object>(options: SpotrOptions<T>): {
  collection: T[];
  threshold: number;
  limit: number;
  debounce: number;
  caseSensitive: boolean;
  minMatchCharLength: number;
} {
  const collection = validateCollection<T>(options.collection);
  validateFields(options.fields);

  if (options.threshold !== undefined) {
    if (typeof options.threshold !== 'number' || options.threshold < 0 || options.threshold > 1) {
      throw new SpotrError(
        `threshold must be between 0 and 1, received ${options.threshold}`,
        ErrorCodes.INVALID_FIELD_CONFIG
      );
    }
  }

  if (options.limit !== undefined && (typeof options.limit !== 'number' || options.limit < 1)) {
    throw new SpotrError(
      `limit must be a positive number, received ${options.limit}`,
      ErrorCodes.INVALID_FIELD_CONFIG
    );
  }

  if (options.debounce !== undefined && (typeof options.debounce !== 'number' || options.debounce < 0)) {
    throw new SpotrError(
      `debounce must be a non-negative number, received ${options.debounce}`,
      ErrorCodes.INVALID_FIELD_CONFIG
    );
  }

  return {
    collection: collection as T[],
    threshold: options.threshold ?? 0.3,
    limit: options.limit ?? Infinity,
    debounce: options.debounce ?? 0,
    caseSensitive: options.caseSensitive ?? false,
    minMatchCharLength: options.minMatchCharLength ?? 1,
  };
}
