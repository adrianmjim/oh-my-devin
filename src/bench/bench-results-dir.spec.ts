import { basename, dirname, isAbsolute } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BENCH_RESULTS_DIR } from './bench-results-dir';
import { BENCH_ROOT_DIR } from './bench-root-dir';

describe('BENCH_RESULTS_DIR', () => {
  it('writes results to their own untracked directory', () => {
    expect(isAbsolute(BENCH_RESULTS_DIR)).toBe(true);
    expect(basename(BENCH_RESULTS_DIR)).toBe('bench-results');
  });

  it('stays out of the committed bench directory', () => {
    expect(BENCH_RESULTS_DIR.startsWith(`${BENCH_ROOT_DIR}/`)).toBe(false);
    expect(dirname(BENCH_RESULTS_DIR)).toBe(dirname(BENCH_ROOT_DIR));
  });
});
