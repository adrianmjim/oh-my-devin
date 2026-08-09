import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import { HOOK_PHASES } from '../setup/hook-phases';
import type { HookCommand } from './hook-command';
import { parseHook } from './parse-hook';

describe('parseHook', () => {
  it('parses every phase the deployed script pipes', () => {
    for (const phase of HOOK_PHASES) {
      const command: HookCommand = parseHook([phase]);

      expect(command).toEqual({ kind: 'hook', phase });
    }
  });

  it('rejects a phase the script never pipes', () => {
    expect(() => parseHook(['compact'])).toThrow(UsageError);
  });

  it('rejects a missing phase', () => {
    expect(() => parseHook([])).toThrow(UsageError);
  });

  it('rejects surplus arguments', () => {
    expect(() => parseHook(['stop', 'extra'])).toThrow(UsageError);
  });
});
