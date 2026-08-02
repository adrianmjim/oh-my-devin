import { describe, expect, it } from 'vitest';
import { TERMINATED_TAIL_CAP } from './terminated-tail-cap';

describe('TERMINATED_TAIL_CAP', () => {
  it('caps the terminated tail at a positive whole number of entries', () => {
    expect(Number.isInteger(TERMINATED_TAIL_CAP)).toBe(true);
    expect(TERMINATED_TAIL_CAP).toBeGreaterThan(0);
  });

  it('stays small enough to keep the listing a bounded summary', () => {
    expect(TERMINATED_TAIL_CAP).toBeLessThanOrEqual(50);
  });
});
