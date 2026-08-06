import { isAbsolute, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BENCH_FIXTURES_DIR } from './bench-fixtures-dir';
import { BENCH_ROOT_DIR } from './bench-root-dir';

describe('BENCH_FIXTURES_DIR', () => {
  it('resolves the committed fixtures directory at the repository root', () => {
    expect(isAbsolute(BENCH_FIXTURES_DIR)).toBe(true);
    expect(BENCH_FIXTURES_DIR).toBe(join(BENCH_ROOT_DIR, 'fixtures'));
  });

  it('sits outside the src tree so flawed fixtures escape the gate globs', () => {
    expect(BENCH_FIXTURES_DIR).not.toContain(join('bench', 'src'));
  });
});
