import { describe, expect, it } from 'vitest';
import { BEGIN_TOKEN } from './begin-token';

describe('BEGIN_TOKEN', () => {
  it('opens an omd region', () => {
    expect(BEGIN_TOKEN).toBe('omd:begin');
  });

  it('is namespaced to omd so foreign markers never match', () => {
    expect(BEGIN_TOKEN.startsWith('omd:')).toBe(true);
  });
});
