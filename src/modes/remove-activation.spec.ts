import { describe, expect, it } from 'vitest';
import type { ModeActivation } from './mode-activation';
import { removeActivation } from './remove-activation';

function activation(mode: string): ModeActivation {
  return { mode, sessionId: 'sess-1', activatedAt: 10, correlatedRunId: null };
}

describe('removeActivation', () => {
  it('clears exactly the named slot', () => {
    const held: readonly ModeActivation[] = removeActivation(
      [activation('plan'), activation('verify')],
      'plan',
    );

    expect(held).toEqual([activation('verify')]);
  });

  it('leaves the slots untouched when the mode is not held', () => {
    const held: readonly ModeActivation[] = removeActivation(
      [activation('plan')],
      'team',
    );

    expect(held).toEqual([activation('plan')]);
  });

  it('leaves the input untouched', () => {
    const held: readonly ModeActivation[] = [activation('plan')];

    removeActivation(held, 'plan');

    expect(held).toEqual([activation('plan')]);
  });
});
