import { describe, expect, it } from 'vitest';
import { VERIFY_MODE_STATE } from './verify-mode-state';

describe('VERIFY_MODE_STATE', () => {
  it('names the mode it activates', () => {
    expect(VERIFY_MODE_STATE.mode).toBe('verify');
  });

  it('injects a context describing the active mode', () => {
    expect(VERIFY_MODE_STATE.context).toContain('verify mode active');
  });

  it('declares the criteria a stop is verified against', () => {
    expect(VERIFY_MODE_STATE.verification.length).toBeGreaterThan(0);
  });
});
