import { describe, expect, it } from 'vitest';
import type { SessionTurnResult } from '../session/session-turn-result';
import { detectDenyHit } from './detect-deny-hit';

function result(overrides: Partial<SessionTurnResult>): SessionTurnResult {
  return { sessionId: 's1', stdout: '', stderr: '', exitCode: 0, ...overrides };
}

describe('detectDenyHit', () => {
  it('returns null on a clean turn', () => {
    expect(detectDenyHit(result({ exitCode: 0 }))).toBeNull();
  });

  it('detects the real headless deny-abort signal', () => {
    const deny: string | null = detectDenyHit(
      result({
        exitCode: 1,
        stderr: 'Error: A tool was rejected by the user',
      }),
    );
    expect(deny).not.toBeNull();
    expect(deny).toMatch(/rejected/i);
  });

  it('returns null when a non-zero turn carries no deny marker', () => {
    expect(
      detectDenyHit(result({ exitCode: 1, stderr: 'some other error' })),
    ).toBeNull();
  });
});
