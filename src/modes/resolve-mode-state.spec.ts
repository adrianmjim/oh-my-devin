import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { ModeState } from '../setup/mode-state';
import { MODE_STATE_CATALOG } from './mode-state-catalog';
import { resolveModeState } from './resolve-mode-state';

describe('resolveModeState', () => {
  it('returns the catalog entry for every known mode', () => {
    for (const [name, state] of MODE_STATE_CATALOG) {
      expect(resolveModeState(name)).toBe(state);
    }
  });

  it('rejects an unknown mode with a UsageError', () => {
    expect((): ModeState => resolveModeState('deep-dive')).toThrow(UsageError);
  });

  it('lists the known modes in the unknown-mode error message', () => {
    expect((): ModeState => resolveModeState('warp')).toThrow(
      'unknown mode "warp" (expected: autopilot, ralph, team, plan, verify)',
    );
  });
});
