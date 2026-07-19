import { describe, expect, it } from 'vitest';
import { exitCodeForClosure } from './exit-code-for-closure';

describe('exitCodeForClosure', () => {
  it('maps a passed close to exit code 0', () => {
    expect(exitCodeForClosure('passed')).toBe(0);
  });

  it('maps blocked and bankrupt to distinct non-zero codes', () => {
    expect(exitCodeForClosure('blocked')).not.toBe(0);
    expect(exitCodeForClosure('bankrupt')).not.toBe(0);
    expect(exitCodeForClosure('blocked')).not.toBe(
      exitCodeForClosure('bankrupt'),
    );
  });
});
