import { describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import { upsertActivation } from './upsert-activation';

function activation(mode: string, activatedAt: number): ModeActivation {
  return { mode, sessionId: 'sess-1', activatedAt, correlatedRunId: null };
}

describe('upsertActivation', () => {
  it('records an activation into an empty slot set', () => {
    expect(upsertActivation([], activation('plan', 10))).toEqual([
      activation('plan', 10),
    ]);
  });

  it('lets several modes coexist in one session', () => {
    const held: readonly ModeActivation[] = upsertActivation(
      [activation('plan', 10)],
      activation('verify', 20),
    );

    expect(held.map((slot: ModeActivation): string => slot.mode)).toEqual([
      'plan',
      'verify',
    ]);
  });

  it('updates the same slot when the mode is re-activated', () => {
    const held: readonly ModeActivation[] = upsertActivation(
      [activation('plan', 10), activation('verify', 20)],
      { ...activation('plan', 30), correlatedRunId: 'run-7' },
    );

    expect(held).toHaveLength(2);
    expect(
      held.filter((slot: ModeActivation): boolean => slot.mode === 'plan'),
    ).toHaveLength(1);
  });

  it('carries the re-activation payload into the updated slot', () => {
    const held: readonly ModeActivation[] = upsertActivation(
      [activation('plan', 10)],
      { ...activation('plan', 30), correlatedRunId: 'run-7' },
    );

    expect(held[0]).toEqual({
      mode: 'plan',
      sessionId: 'sess-1',
      activatedAt: 30,
      correlatedRunId: 'run-7',
    });
  });

  it('leaves the input untouched', () => {
    const held: readonly ModeActivation[] = [activation('plan', 10)];

    upsertActivation(held, activation('verify', 20));

    expect(held).toEqual([activation('plan', 10)]);
  });
});
