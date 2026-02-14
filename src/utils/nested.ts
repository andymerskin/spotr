export function getNestedValue(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    if (Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

export function hasNestedPath(obj: unknown, path: string): boolean {
  const value = getNestedValue(obj, path);
  return value !== undefined;
}
