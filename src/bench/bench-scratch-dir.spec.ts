import { basename, dirname, isAbsolute } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BENCH_ROOT_DIR } from './bench-root-dir';
import { BENCH_SCRATCH_DIR } from './bench-scratch-dir';

describe('BENCH_SCRATCH_DIR', () => {
  it('provisions scratch projects in their own untracked directory', () => {
    expect(isAbsolute(BENCH_SCRATCH_DIR)).toBe(true);
    expect(basename(BENCH_SCRATCH_DIR)).toBe('bench-scratch');
  });

  it('stays inside the repository beside the committed bench directory', () => {
    expect(BENCH_SCRATCH_DIR.startsWith(`${BENCH_ROOT_DIR}/`)).toBe(false);
    expect(dirname(BENCH_SCRATCH_DIR)).toBe(dirname(BENCH_ROOT_DIR));
  });
});
