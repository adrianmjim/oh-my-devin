import { describe, expect, it } from 'vitest';
import { AUTOPILOT_MODE_STATE } from './autopilot-mode-state';

describe('AUTOPILOT_MODE_STATE', () => {
  it('names the mode it activates', () => {
    expect(AUTOPILOT_MODE_STATE.mode).toBe('autopilot');
  });

  it('injects a context describing the active mode', () => {
    expect(AUTOPILOT_MODE_STATE.context).toContain('autopilot mode active');
  });

  it('declares the criteria a stop is verified against', () => {
    expect(AUTOPILOT_MODE_STATE.verification.length).toBeGreaterThan(0);
  });
});
