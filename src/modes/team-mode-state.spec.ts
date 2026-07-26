import { describe, expect, it } from 'vitest';
import { TEAM_MODE_STATE } from './team-mode-state';

describe('TEAM_MODE_STATE', () => {
  it('names the mode it activates', () => {
    expect(TEAM_MODE_STATE.mode).toBe('team');
  });

  it('injects a context describing the active mode', () => {
    expect(TEAM_MODE_STATE.context).toContain('team mode active');
  });

  it('declares the criteria a stop is verified against', () => {
    expect(TEAM_MODE_STATE.verification.length).toBeGreaterThan(0);
  });
});
