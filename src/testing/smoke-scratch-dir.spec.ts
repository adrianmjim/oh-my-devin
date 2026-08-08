import { tmpdir } from 'node:os';
import { basename, isAbsolute, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SMOKE_SCRATCH_DIR } from './smoke-scratch-dir';

describe('SMOKE_SCRATCH_DIR', () => {
  it('hosts smoke scratch projects in their own untracked directory', () => {
    expect(isAbsolute(SMOKE_SCRATCH_DIR)).toBe(true);
    expect(basename(SMOKE_SCRATCH_DIR)).toBe('smoke-scratch');
  });

  it('stays inside the repository rather than the untrusted system temp directory', () => {
    const fromTemp: string = relative(tmpdir(), SMOKE_SCRATCH_DIR);
    expect(fromTemp.startsWith('..') || isAbsolute(fromTemp)).toBe(true);
  });
});
