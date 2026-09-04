import { describe, expect, it } from 'vitest';
import { isRunClaim } from './is-run-claim';

describe('isRunClaim', () => {
  it('accepts a claim naming a directory, its worktree kind, and a session', () => {
    expect(
      isRunClaim({
        workingDirectory: '/project/.omd/worktrees/w1',
        worktreeProvisioned: true,
        sessionId: 'session-a',
      }),
    ).toBe(true);
  });

  it('accepts a claim that has not yet learned its session', () => {
    expect(
      isRunClaim({
        workingDirectory: '/project',
        worktreeProvisioned: false,
        sessionId: null,
      }),
    ).toBe(true);
  });

  it('rejects a claim missing or mistyping a field', () => {
    expect(isRunClaim({ worktreeProvisioned: true, sessionId: null })).toBe(
      false,
    );
    expect(
      isRunClaim({
        workingDirectory: '/project',
        worktreeProvisioned: 'yes',
        sessionId: null,
      }),
    ).toBe(false);
    expect(
      isRunClaim({
        workingDirectory: '/project',
        worktreeProvisioned: false,
        sessionId: 7,
      }),
    ).toBe(false);
  });

  it('rejects values that are not claim objects', () => {
    expect(isRunClaim(null)).toBe(false);
    expect(isRunClaim('claim')).toBe(false);
    expect(isRunClaim([])).toBe(false);
  });
});
