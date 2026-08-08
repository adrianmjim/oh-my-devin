import { tmpdir } from 'node:os';
import { basename, isAbsolute } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SMOKE_SCRATCH_DIR } from './smoke-scratch-dir';

describe('SMOKE_SCRATCH_DIR', () => {
  it('hosts smoke scratch projects in their own untracked directory', () => {
    expect(isAbsolute(SMOKE_SCRATCH_DIR)).toBe(true);
    expect(basename(SMOKE_SCRATCH_DIR)).toBe('smoke-scratch');
  });

  it('stays inside the repository rather than the untrusted system temp directory', () => {
    expect(SMOKE_SCRATCH_DIR.startsWith(tmpdir())).toBe(false);
  });
});
