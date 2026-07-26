import { describe, expect, it } from 'vitest';
import { requireSeatArgument } from './require-seat-argument';

describe('requireSeatArgument', () => {
  it('yields the argument it is given', () => {
    const argument = { seat: 'security', claim: 'safe' };

    expect(requireSeatArgument(argument)).toBe(argument);
  });

  it('refuses a vanished cluster member', () => {
    expect(() => requireSeatArgument(undefined)).toThrow(
      'echo cluster member vanished',
    );
  });
});
