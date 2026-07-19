import { describe, expect, it } from 'vitest';
import type { ModeState } from '../setup/mode-state';
import { MODE_STATE_CATALOG } from './mode-state-catalog';

describe('MODE_STATE_CATALOG', () => {
  it('covers exactly the five modes with persistent state', () => {
    expect([...MODE_STATE_CATALOG.keys()].sort()).toEqual([
      'autopilot',
      'plan',
      'ralph',
      'team',
      'verify',
    ]);
  });

  it('has no entry for deep-dive', () => {
    expect(MODE_STATE_CATALOG.has('deep-dive')).toBe(false);
  });

  it('gives every entry a mode field equal to its key', () => {
    for (const [name, state] of MODE_STATE_CATALOG) {
      expect(state.mode).toBe(name);
    }
  });

  it('gives every entry a non-empty context and verification', () => {
    for (const state of MODE_STATE_CATALOG.values()) {
      expect(state.context.length).toBeGreaterThan(0);
      expect(state.verification.length).toBeGreaterThan(0);
      for (const criterion of state.verification) {
        expect(criterion.length).toBeGreaterThan(0);
      }
    }
  });

  it('carries the pipeline outcome criterion for team and autopilot', () => {
    const team: ModeState | undefined = MODE_STATE_CATALOG.get('team');
    const autopilot: ModeState | undefined =
      MODE_STATE_CATALOG.get('autopilot');
    expect(team?.verification).toEqual(['pipeline terminal outcome reported']);
    expect(autopilot?.verification).toEqual([
      'pipeline terminal outcome reported',
    ]);
  });
});
