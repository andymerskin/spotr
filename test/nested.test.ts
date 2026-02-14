import { describe, it, expect } from 'vitest';
import { getNestedValue, hasNestedPath } from '../src/utils/nested';

describe('getNestedValue', () => {
  it('returns value for simple property', () => {
    const obj = { name: 'test' };
    expect(getNestedValue(obj, 'name')).toBe('test');
  });

  it('returns value for nested property', () => {
    const obj = { address: { city: 'NYC' } };
    expect(getNestedValue(obj, 'address.city')).toBe('NYC');
  });

  it('returns value for deeply nested property', () => {
    const obj = { company: { location: { city: 'SF' } } };
    expect(getNestedValue(obj, 'company.location.city')).toBe('SF');
  });

  it('returns undefined for missing property', () => {
    const obj = { name: 'test' };
    expect(getNestedValue(obj, 'missing')).toBeUndefined();
  });

  it('returns undefined for missing nested property', () => {
    const obj = { address: {} };
    expect(getNestedValue(obj, 'address.city')).toBeUndefined();
  });

  it('returns undefined for null object', () => {
    expect(getNestedValue(null, 'name')).toBeUndefined();
  });

  it('returns undefined for array in path', () => {
    const obj = { items: [{ name: 'test' }] };
    expect(getNestedValue(obj, 'items.name')).toBeUndefined();
  });
});

describe('hasNestedPath', () => {
  it('returns true for existing path', () => {
    const obj = { address: { city: 'NYC' } };
    expect(hasNestedPath(obj, 'address.city')).toBe(true);
  });

  it('returns false for missing path', () => {
    const obj = { name: 'test' };
    expect(hasNestedPath(obj, 'address.city')).toBe(false);
  });
});
