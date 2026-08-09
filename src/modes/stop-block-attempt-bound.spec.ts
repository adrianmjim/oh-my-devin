import { describe, expect, it } from 'vitest';
import { STOP_BLOCK_ATTEMPT_BOUND } from './stop-block-attempt-bound';

describe('STOP_BLOCK_ATTEMPT_BOUND', () => {
  it('bounds consecutive blocked stops at five', () => {
    expect(STOP_BLOCK_ATTEMPT_BOUND).toBe(5);
  });
});
