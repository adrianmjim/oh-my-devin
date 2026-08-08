import { describe, expect, it } from 'vitest';
import { isModeActivation } from './is-mode-activation';

const ACTIVATION: Record<string, unknown> = {
  mode: 'plan',
  sessionId: 'sess-1',
  activatedAt: 10,
  correlatedRunId: null,
};

describe('isModeActivation', () => {
  it('recognizes an activation with no correlated run', () => {
    expect(isModeActivation(ACTIVATION)).toBe(true);
  });

  it('recognizes an activation carrying a correlated run', () => {
    expect(isModeActivation({ ...ACTIVATION, correlatedRunId: 'run-7' })).toBe(
      true,
    );
  });

  it('rejects an activation with no owning session', () => {
    expect(isModeActivation({ ...ACTIVATION, sessionId: 7 })).toBe(false);
  });

  it('rejects an activation whose correlation is neither a run nor null', () => {
    expect(isModeActivation({ ...ACTIVATION, correlatedRunId: 7 })).toBe(false);
  });

  it('rejects values that are not objects', () => {
    expect(isModeActivation(null)).toBe(false);
    expect(isModeActivation([])).toBe(false);
    expect(isModeActivation('plan')).toBe(false);
  });
});
