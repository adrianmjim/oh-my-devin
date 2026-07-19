import { describe, expect, it } from 'vitest';
import { exitCodeForOutcome } from './exit-code-for-outcome';

describe('exitCodeForOutcome', () => {
  it('maps each outcome to its fixed exit code', () => {
    expect(exitCodeForOutcome(null)).toBe(0);
    expect(exitCodeForOutcome('deny')).toBe(2);
    expect(exitCodeForOutcome('invalid_artifact')).toBe(3);
    expect(exitCodeForOutcome('budget')).toBe(4);
  });

  it('gives each tier a code distinct from success and from each other', () => {
    const codes: readonly number[] = [
      exitCodeForOutcome(null),
      exitCodeForOutcome('deny'),
      exitCodeForOutcome('invalid_artifact'),
      exitCodeForOutcome('budget'),
    ];
    expect(new Set(codes).size).toBe(4);
  });
});
