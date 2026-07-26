import { describe, expect, it } from 'vitest';
import { resolveRefusedTarget } from './resolve-refused-target';

describe('resolveRefusedTarget', () => {
  it('refuses the component with the discovery reason', () => {
    expect(resolveRefusedTarget('teams')).toEqual({
      kind: 'refused',
      component: 'teams',
      reason: 'no verified user-level discovery location',
    });
  });
});
