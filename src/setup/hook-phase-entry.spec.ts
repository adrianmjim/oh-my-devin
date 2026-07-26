import { describe, expect, it } from 'vitest';
import { hookPhaseEntry } from './hook-phase-entry';

describe('hookPhaseEntry', () => {
  it('holds a single command hook for the phase', () => {
    expect(hookPhaseEntry('node run.mjs', 'stop')).toEqual({
      hooks: [{ type: 'command', command: 'node run.mjs stop' }],
    });
  });

  it('appends the phase to the base command', () => {
    expect(
      hookPhaseEntry('node run.mjs', 'session-start').hooks[0]?.command,
    ).toBe('node run.mjs session-start');
  });
});
