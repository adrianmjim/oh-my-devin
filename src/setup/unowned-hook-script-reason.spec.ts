import { describe, expect, it } from 'vitest';
import { UNOWNED_HOOK_SCRIPT_REASON } from './unowned-hook-script-reason';

describe('UNOWNED_HOOK_SCRIPT_REASON', () => {
  it('states that the hook script was not installed by omd', () => {
    expect(UNOWNED_HOOK_SCRIPT_REASON).toBe(
      'its hook script was not installed by omd',
    );
  });
});
