import { describe, expect, it } from 'vitest';
import type { AnonymizedArgument } from './anonymized-argument';
import type { TypedPosition } from './typed-position';
import { relayAnonymized } from './relay-anonymized';

const POSITIONS: readonly TypedPosition[] = [
  {
    seat: 'sre',
    lens: 'operability-and-failure-modes',
    kind: 'objection',
    domain: 'operability',
    severity: 'high',
    concern: 'deployment_coupling',
  },
  {
    seat: 'security-reviewer',
    lens: 'threats',
    kind: 'preference',
    domain: 'threats',
    severity: 'low',
    concern: 'prefers_defense_in_depth',
  },
];

describe('relayAnonymized', () => {
  it('strips the seat and lens from every relayed argument', () => {
    const relayed: readonly AnonymizedArgument[] = relayAnonymized(POSITIONS);

    for (const argument of relayed) {
      expect('seat' in argument).toBe(false);
      expect('lens' in argument).toBe(false);
    }
  });

  it('preserves the content of each argument', () => {
    const relayed: readonly AnonymizedArgument[] = relayAnonymized(POSITIONS);

    expect(relayed[0]).toEqual({
      kind: 'objection',
      domain: 'operability',
      severity: 'high',
      concern: 'deployment_coupling',
    });
    expect(relayed).toHaveLength(2);
  });

  it('is deterministic for identical input', () => {
    expect(relayAnonymized(POSITIONS)).toEqual(relayAnonymized(POSITIONS));
  });
});
