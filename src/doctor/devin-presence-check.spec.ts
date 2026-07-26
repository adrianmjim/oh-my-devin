import { describe, expect, it } from 'vitest';
import { devinPresenceCheck } from './devin-presence-check';

describe('devinPresenceCheck', () => {
  it('passes when devin answered', () => {
    expect(
      devinPresenceCheck({ exitCode: 0, stdout: 'devin 1.0.0', stderr: '' }),
    ).toEqual({
      name: 'devin-cli',
      outcome: 'pass',
      message: 'devin executable found on PATH',
    });
  });

  it('fails when devin could not be run', () => {
    expect(devinPresenceCheck(null).outcome).toBe('fail');
  });

  it('fails when devin answered with a failure', () => {
    expect(
      devinPresenceCheck({ exitCode: 1, stdout: '', stderr: 'boom' }).outcome,
    ).toBe('fail');
  });
});
