import { describe, expect, it } from 'vitest';
import { APPROVE_OUTCOME } from './approve-outcome';

describe('APPROVE_OUTCOME', () => {
  it('names the workflow outcome an approved gate takes', () => {
    expect(APPROVE_OUTCOME).toBe('passed');
  });
});
