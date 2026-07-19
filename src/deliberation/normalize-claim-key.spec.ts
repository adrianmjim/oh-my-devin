import { describe, expect, it } from 'vitest';
import { normalizeClaimKey } from './normalize-claim-key';

describe('normalizeClaimKey', () => {
  it('treats claims differing only in case and whitespace as the same key', () => {
    const a: string = normalizeClaimKey({ seat: 's1', claim: 'Token   Leak' });
    const b: string = normalizeClaimKey({ seat: 's2', claim: ' token leak ' });
    expect(a).toBe(b);
  });

  it('distinguishes materially different claims', () => {
    const a: string = normalizeClaimKey({ seat: 's1', claim: 'token leak' });
    const b: string = normalizeClaimKey({ seat: 's2', claim: 'rate limit' });
    expect(a).not.toBe(b);
  });
});
