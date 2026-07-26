import { describe, expect, it } from 'vitest';
import { isDissentUnchanged } from './is-dissent-unchanged';
import type { TypedPosition } from './typed-position';

function objection(seat: string, domain: string): TypedPosition {
  return {
    seat,
    lens: seat,
    kind: 'objection',
    domain,
    severity: 'high',
    concern: 'blocks',
    assumptions: [],
    reconsiderWhen: [],
  };
}

describe('isDissentUnchanged', () => {
  it('is false on the first round, when there is no previous dissent', () => {
    expect(isDissentUnchanged([objection('a', 'auth')], [])).toBe(false);
  });

  it('is true when a seat repeats its objection on the same domain', () => {
    expect(
      isDissentUnchanged([objection('a', 'auth')], [objection('a', 'auth')]),
    ).toBe(true);
  });

  it('is false when the dissent moved to another domain', () => {
    expect(
      isDissentUnchanged([objection('a', 'latency')], [objection('a', 'auth')]),
    ).toBe(false);
  });

  it('is false when the dissent moved to another seat', () => {
    expect(
      isDissentUnchanged([objection('b', 'auth')], [objection('a', 'auth')]),
    ).toBe(false);
  });
});
