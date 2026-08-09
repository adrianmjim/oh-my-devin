import { describe, expect, it } from 'vitest';
import { isStagedIdentity } from './is-staged-identity';

const STAGED: Record<string, unknown> = {
  sessionId: 'sess-1',
  invocation: 'mode set plan',
  stagedAt: 10,
};

describe('isStagedIdentity', () => {
  it('recognizes a staged identity', () => {
    expect(isStagedIdentity(STAGED)).toBe(true);
  });

  it('rejects one carrying no invocation', () => {
    expect(isStagedIdentity({ ...STAGED, invocation: 7 })).toBe(false);
  });

  it('rejects one carrying no staging time', () => {
    expect(isStagedIdentity({ ...STAGED, stagedAt: 'now' })).toBe(false);
  });

  it('rejects values that are not objects', () => {
    expect(isStagedIdentity(null)).toBe(false);
    expect(isStagedIdentity([])).toBe(false);
  });
});
