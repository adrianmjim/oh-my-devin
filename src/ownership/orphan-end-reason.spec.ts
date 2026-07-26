import { describe, expect, it } from 'vitest';
import { ORPHAN_END_REASON } from './orphan-end-reason';

describe('ORPHAN_END_REASON', () => {
  it('states that an end marker stands alone', () => {
    expect(ORPHAN_END_REASON).toBe(
      'its omd region end marker has no begin marker',
    );
  });
});
