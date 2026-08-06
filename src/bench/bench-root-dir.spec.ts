import { basename, dirname, isAbsolute } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BENCH_ROOT_DIR } from './bench-root-dir';

describe('BENCH_ROOT_DIR', () => {
  it('resolves the bench directory at the repository root', () => {
    expect(isAbsolute(BENCH_ROOT_DIR)).toBe(true);
    expect(basename(BENCH_ROOT_DIR)).toBe('bench');
  });

  it('is a sibling of src rather than a child of it', () => {
    expect(basename(dirname(BENCH_ROOT_DIR))).not.toBe('src');
  });
});
