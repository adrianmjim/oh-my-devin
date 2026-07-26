import { describe, expect, it } from 'vitest';
import { REGION_TOKEN } from './region-token';

describe('REGION_TOKEN', () => {
  it('marks an omd region inside a JSON document comment', () => {
    expect(REGION_TOKEN).toBe('omd:region');
  });

  it('is namespaced to omd so foreign comments never match', () => {
    expect(REGION_TOKEN.startsWith('omd:')).toBe(true);
  });
});
