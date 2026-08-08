import { describe, expect, it } from 'vitest';
import type { ExclusivityOutcome } from './exclusivity-outcome';
import type { ModeActivation } from './mode-activation';
import { resolveExclusivity } from './resolve-exclusivity';
import type { SessionId } from './session-id';

function activation(mode: string, sessionId: string): ModeActivation {
  return { mode, sessionId, activatedAt: 10, correlatedRunId: null };
}

const ALL_LIVE = (): boolean => true;

describe('resolveExclusivity', () => {
  it('lets an activation into an empty project', () => {
    expect(resolveExclusivity([], ALL_LIVE, 'team', 'sess-1')).toBeNull();
  });

  it('refuses a class member held by another live session', () => {
    const outcome: ExclusivityOutcome = resolveExclusivity(
      [activation('autopilot', 'sess-2')],
      ALL_LIVE,
      'team',
      'sess-1',
    );

    expect(outcome).toEqual({
      kind: 'refused',
      mode: 'team',
      reason: 'exclusive-conflict',
      holder: { mode: 'autopilot', sessionId: 'sess-2' },
    });
  });

  it('displaces a class member held by the activating session', () => {
    const outcome: ExclusivityOutcome = resolveExclusivity(
      [activation('autopilot', 'sess-1')],
      ALL_LIVE,
      'ralph',
      'sess-1',
    );

    expect(outcome).toEqual({
      kind: 'displaced',
      mode: 'ralph',
      displaced: 'autopilot',
    });
  });

  it('lets an unclassed mode join a class member freely', () => {
    expect(
      resolveExclusivity(
        [activation('autopilot', 'sess-1')],
        ALL_LIVE,
        'plan',
        'sess-1',
      ),
    ).toBeNull();
  });

  it('lets an unclassed mode join across sessions', () => {
    expect(
      resolveExclusivity(
        [activation('autopilot', 'sess-2')],
        ALL_LIVE,
        'verify',
        'sess-1',
      ),
    ).toBeNull();
  });

  it('does not refuse for a stale holder', () => {
    const isLive = (sessionId: SessionId): boolean => sessionId === 'sess-1';

    expect(
      resolveExclusivity(
        [activation('autopilot', 'sess-2')],
        isLive,
        'team',
        'sess-1',
      ),
    ).toBeNull();
  });

  it('re-activating the held class member displaces nothing', () => {
    expect(
      resolveExclusivity(
        [activation('team', 'sess-1')],
        ALL_LIVE,
        'team',
        'sess-1',
      ),
    ).toBeNull();
  });

  it('refuses naming the first live holder when several exist', () => {
    const outcome: ExclusivityOutcome = resolveExclusivity(
      [activation('autopilot', 'sess-2'), activation('ralph', 'sess-3')],
      ALL_LIVE,
      'team',
      'sess-1',
    );

    expect(outcome?.kind).toBe('refused');
  });
});
