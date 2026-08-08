import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BENCH_BASELINES_DIR } from './bench-baselines-dir';
import { BENCH_ROOT_DIR } from './bench-root-dir';

describe('BENCH_BASELINES_DIR', () => {
  it('keeps committed baselines beside the fixtures they were run against', () => {
    expect(BENCH_BASELINES_DIR).toBe(join(BENCH_ROOT_DIR, 'baselines'));
  });
});
