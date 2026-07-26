import { describe, expect, it } from 'vitest';
import { REJECT_OUTCOME } from './reject-outcome';

describe('REJECT_OUTCOME', () => {
  it('names the workflow outcome a rejected gate takes', () => {
    expect(REJECT_OUTCOME).toBe('blocked');
  });
});
