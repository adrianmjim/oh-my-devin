import { describe, expect, it } from 'vitest';
import { BENCH_SAVE_ENV } from './bench-save-env';

describe('BENCH_SAVE_ENV', () => {
  it('names the save opt-in the spec fixes', () => {
    expect(BENCH_SAVE_ENV).toBe('OMD_BENCH_SAVE');
  });
});
