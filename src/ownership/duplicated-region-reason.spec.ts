import { describe, expect, it } from 'vitest';
import { DUPLICATED_REGION_REASON } from './duplicated-region-reason';

describe('DUPLICATED_REGION_REASON', () => {
  it('states that the region appears more than once', () => {
    expect(DUPLICATED_REGION_REASON).toBe(
      'it carries more than one omd region of that name',
    );
  });
});
