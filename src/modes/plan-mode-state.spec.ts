import { describe, expect, it } from 'vitest';
import { PLAN_MODE_STATE } from './plan-mode-state';

describe('PLAN_MODE_STATE', () => {
  it('names the mode it activates', () => {
    expect(PLAN_MODE_STATE.mode).toBe('plan');
  });

  it('injects a context describing the active mode', () => {
    expect(PLAN_MODE_STATE.context).toContain('plan mode active');
  });

  it('declares the criteria a stop is verified against', () => {
    expect(PLAN_MODE_STATE.verification.length).toBeGreaterThan(0);
  });
});
