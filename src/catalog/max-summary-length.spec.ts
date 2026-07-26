import { describe, expect, it } from 'vitest';
import { MAX_SUMMARY_LENGTH } from './max-summary-length';

describe('MAX_SUMMARY_LENGTH', () => {
  it('bounds a prompt summary to a terminal line', () => {
    expect(MAX_SUMMARY_LENGTH).toBe(80);
  });
});
