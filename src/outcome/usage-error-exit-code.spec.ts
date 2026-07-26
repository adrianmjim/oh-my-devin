import { describe, expect, it } from 'vitest';
import { USAGE_ERROR_EXIT_CODE } from './usage-error-exit-code';

describe('USAGE_ERROR_EXIT_CODE', () => {
  it('is the conventional usage exit code', () => {
    expect(USAGE_ERROR_EXIT_CODE).toBe(64);
  });
});
