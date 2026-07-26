import { describe, expect, it } from 'vitest';
import { devinVersionCheck } from './devin-version-check';
import { PINNED_DEVIN_VERSION } from './pinned-devin-version';

describe('devinVersionCheck', () => {
  it('passes on the pinned version', () => {
    expect(
      devinVersionCheck({
        exitCode: 0,
        stdout: `devin ${PINNED_DEVIN_VERSION}`,
        stderr: '',
      }).outcome,
    ).toBe('pass');
  });

  it('warns on a drifting version, naming both', () => {
    const check = devinVersionCheck({
      exitCode: 0,
      stdout: 'devin 1.2.3',
      stderr: '',
    });

    expect(check.outcome).toBe('warn');
    expect(check.message).toContain('1.2.3');
    expect(check.message).toContain(PINNED_DEVIN_VERSION);
  });

  it('fails when the version cannot be determined', () => {
    expect(devinVersionCheck(null).outcome).toBe('fail');
    expect(
      devinVersionCheck({ exitCode: 0, stdout: 'devin', stderr: '' }).outcome,
    ).toBe('fail');
  });
});
