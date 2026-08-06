import { describe, expect, it } from 'vitest';
import { BENCH_MODEL_ENV } from './bench-model-env';

describe('BENCH_MODEL_ENV', () => {
  it('names the per-run model override the spec fixes', () => {
    expect(BENCH_MODEL_ENV).toBe('OMD_BENCH_MODEL');
  });
});
