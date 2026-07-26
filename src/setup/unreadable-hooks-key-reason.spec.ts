import { describe, expect, it } from 'vitest';
import { UNREADABLE_HOOKS_KEY_REASON } from './unreadable-hooks-key-reason';

describe('UNREADABLE_HOOKS_KEY_REASON', () => {
  it('states that the hooks key holds no extensible event map', () => {
    expect(UNREADABLE_HOOKS_KEY_REASON).toBe(
      'its hooks key does not hold an event map omd can extend',
    );
  });
});
