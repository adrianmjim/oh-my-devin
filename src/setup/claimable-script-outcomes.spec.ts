import { describe, expect, it } from 'vitest';
import { CLAIMABLE_SCRIPT_OUTCOMES } from './claimable-script-outcomes';

describe('CLAIMABLE_SCRIPT_OUTCOMES', () => {
  it('claims the registry when the script is owned by omd', () => {
    for (const outcome of ['created', 'updated', 'unchanged', 'preserved']) {
      expect(CLAIMABLE_SCRIPT_OUTCOMES.has(outcome as never)).toBe(true);
    }
  });

  it('does not claim the registry when the script merge failed', () => {
    expect(CLAIMABLE_SCRIPT_OUTCOMES.has('conflicted')).toBe(false);
    expect(CLAIMABLE_SCRIPT_OUTCOMES.has('blocked')).toBe(false);
  });
});
