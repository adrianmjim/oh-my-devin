import { describe, expect, it } from 'vitest';
import { TRANSCRIPT_READ_BOUND } from './transcript-read-bound';

describe('TRANSCRIPT_READ_BOUND', () => {
  it('bounds the transcript slice one pipe invocation may read', () => {
    expect(typeof TRANSCRIPT_READ_BOUND).toBe('number');
    expect(TRANSCRIPT_READ_BOUND).toBeGreaterThan(0);
    expect(Number.isInteger(TRANSCRIPT_READ_BOUND)).toBe(true);
  });
});
