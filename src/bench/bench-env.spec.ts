import { describe, expect, it } from 'vitest';
import { BENCH_ENV } from './bench-env';

describe('BENCH_ENV', () => {
  it('names the opt-in the spec fixes', () => {
    expect(BENCH_ENV).toBe('OMD_BENCH');
  });
});
