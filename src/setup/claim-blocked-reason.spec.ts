import { describe, expect, it } from 'vitest';
import { claimBlockedReason } from './claim-blocked-reason';

describe('claimBlockedReason', () => {
  it('names the event whose hooks omd cannot extend', () => {
    expect(claimBlockedReason('Stop')).toBe(
      'its Stop hooks are not a list omd can extend',
    );
  });

  it('reads as a reason clause, not a sentence', () => {
    expect(claimBlockedReason('SessionStart').startsWith('its ')).toBe(true);
    expect(claimBlockedReason('SessionStart').endsWith('.')).toBe(false);
  });
});
