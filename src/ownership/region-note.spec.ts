import { describe, expect, it } from 'vitest';
import { REGION_NOTE } from './region-note';

describe('REGION_NOTE', () => {
  it('tells the reader which command maintains the region', () => {
    expect(REGION_NOTE).toContain('omd setup');
  });

  it('promises that content outside the region is preserved', () => {
    expect(REGION_NOTE).toContain('content outside this region is preserved');
  });
});
