import { describe, expect, it } from 'vitest';
import { RALPH_MODE_STATE } from './ralph-mode-state';

describe('RALPH_MODE_STATE', () => {
  it('names the mode it activates', () => {
    expect(RALPH_MODE_STATE.mode).toBe('ralph');
  });

  it('injects a context describing the active mode', () => {
    expect(RALPH_MODE_STATE.context).toContain('ralph mode active');
  });

  it('declares the criteria a stop is verified against', () => {
    expect(RALPH_MODE_STATE.verification.length).toBeGreaterThan(0);
  });
});
