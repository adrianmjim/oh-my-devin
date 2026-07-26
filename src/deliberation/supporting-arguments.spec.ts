import { describe, expect, it } from 'vitest';
import { supportingArguments } from './supporting-arguments';
import type { TypedPosition } from './typed-position';

function position(
  kind: 'objection' | 'preference',
  seat: string,
): TypedPosition {
  return {
    seat,
    lens: seat,
    kind,
    domain: seat,
    severity: 'low',
    concern: `${seat}-claim`,
    assumptions: [],
    reconsiderWhen: [],
  };
}

describe('supportingArguments', () => {
  it('keeps only the preferences', () => {
    expect(
      supportingArguments([
        position('preference', 'a'),
        position('objection', 'b'),
      ]),
    ).toEqual([{ seat: 'a', claim: 'a-claim' }]);
  });

  it('carries the concern of each preference as its claim', () => {
    expect(supportingArguments([position('preference', 'x')])[0]?.claim).toBe(
      'x-claim',
    );
  });

  it('is empty when nothing supports the proposal', () => {
    expect(supportingArguments([position('objection', 'a')])).toEqual([]);
  });
});
