export class SpotrError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SpotrError';
  }
}

export const ErrorCodes = {
  INVALID_COLLECTION: 'INVALID_COLLECTION',
  INVALID_FIELD_CONFIG: 'INVALID_FIELD_CONFIG',
  INVALID_FIELD_WEIGHT: 'INVALID_FIELD_WEIGHT',
  INVALID_KEYWORD: 'INVALID_KEYWORD',
  INVALID_HANDLER_RETURN: 'INVALID_HANDLER_RETURN',
  INVALID_MAX_STRING_LENGTH: 'INVALID_MAX_STRING_LENGTH',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
