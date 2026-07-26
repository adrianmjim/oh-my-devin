import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseDeliberationTunables } from './parse-deliberation-tunables';

describe('parseDeliberationTunables', () => {
  it('parses the rounds cap and defaults the rest', () => {
    expect(parseDeliberationTunables({ rounds_cap: 3 })).toEqual({
      roundsCap: 3,
      blockingThreshold: 'high',
      wallTimeMs: null,
    });
  });

  it('parses a declared blocking threshold and wall time', () => {
    expect(
      parseDeliberationTunables({
        rounds_cap: 2,
        blocking_threshold: 'medium',
        wall_time_ms: 5000,
      }),
    ).toEqual({
      roundsCap: 2,
      blockingThreshold: 'medium',
      wallTimeMs: 5000,
    });
  });

  it('refuses a value that is not a mapping', () => {
    expect(() => parseDeliberationTunables([])).toThrow(
      CouncilDeclarationError,
    );
  });

  it('refuses a rounds cap that is not a positive integer', () => {
    expect(() => parseDeliberationTunables({ rounds_cap: 0 })).toThrow(
      /rounds_cap/,
    );
    expect(() => parseDeliberationTunables({ rounds_cap: 1.5 })).toThrow(
      /rounds_cap/,
    );
  });

  it('refuses an unknown blocking threshold', () => {
    expect(() =>
      parseDeliberationTunables({
        rounds_cap: 1,
        blocking_threshold: 'urgent',
      }),
    ).toThrow(/blocking_threshold/);
  });

  it('refuses a non-positive wall time', () => {
    expect(() =>
      parseDeliberationTunables({ rounds_cap: 1, wall_time_ms: 0 }),
    ).toThrow(/wall_time_ms/);
  });
});
