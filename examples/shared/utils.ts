// Constants
export const PEOPLE_EXAMPLES = ['alice', 'johnson', 'acme', 'usa'];
export const GAMES_EXAMPLES = ['witcher', 'done', 'ps5', 'nintendo'];

export const EDITOR_WIDTH_KEY = 'spotr-editor-width';
export const DEFAULT_EDITOR_WIDTH = 360;
export const MIN_EDITOR_WIDTH = 280;

// Helper to extract editable config (exclude collection and handler functions)
export function extractEditableConfig(config: Record<string, unknown>): Record<string, unknown> {
  const { collection, keywords, ...rest } = config as Record<string, unknown>;
  const result: Record<string, unknown> = { ...rest };
  
  if (keywords) {
    if (Array.isArray(keywords)) {
      result.keywords = keywords.map((k: { name: string; triggers: string[] }) => ({
        name: k.name,
        triggers: k.triggers,
      }));
    } else {
      result.keywords = {
        mode: (keywords as { mode?: string }).mode,
        definitions: ((keywords as { definitions: { name: string; triggers: string[] }[] }).definitions || []).map((k) => ({
          name: k.name,
          triggers: k.triggers,
        })),
      };
    }
  }
  
  return result;
}

// Get nested value using dot notation
export function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

// Format a value for table display
export function formatCellValue(val: unknown): string {
  if (val == null) return '-';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
  return String(val);
}

// Parse config and merge with handlers
// This is a pure function that takes parsed JSON and handlers, returns merged config
export function parseConfigWithHandlers(
  parsed: Record<string, unknown>,
  handlers: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...parsed };
  
  // Merge with handlers from section defaults
  if (result.keywords) {
    if (Array.isArray(result.keywords)) {
      result.keywords = (result.keywords as Array<{ name: string; triggers: string[] }>)
        .map((k) => ({
          ...k,
          handler: handlers[k.name],
        }))
        .filter((k: { handler?: unknown }) => k.handler);
    } else if ((result.keywords as { definitions?: unknown[] }).definitions) {
      result.keywords = {
        mode: (result.keywords as { mode?: string }).mode || 'and',
        definitions: ((result.keywords as { definitions: Array<{ name: string; triggers: string[] }> }).definitions || [])
          .map((k) => ({
            ...k,
            handler: handlers[k.name],
          }))
          .filter((k: { handler?: unknown }) => k.handler),
      };
    }
  }
  
  return result;
}
