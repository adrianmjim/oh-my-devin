import { describe, expect, it } from 'vitest';
import { HOOK_SCRIPT_FILENAME } from './hook-script-filename';

describe('HOOK_SCRIPT_FILENAME', () => {
  it('names the installed hook script', () => {
    expect(HOOK_SCRIPT_FILENAME).toBe('omd-mode.mjs');
  });

  it('is an ES module so node runs it under any package type', () => {
    expect(HOOK_SCRIPT_FILENAME.endsWith('.mjs')).toBe(true);
  });

  it('is a bare filename, not a path', () => {
    expect(HOOK_SCRIPT_FILENAME).not.toContain('/');
  });
});
