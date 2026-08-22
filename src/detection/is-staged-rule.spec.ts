import { describe, expect, it } from 'vitest';
import { isStagedRule } from './is-staged-rule';

describe('isStagedRule', () => {
  it('recognizes a staged rule', () => {
    expect(
      isStagedRule({
        text: 'the data owner reviews migrations',
        hash: 'abc',
        sessionId: 'sess-1',
        stagedAt: 100,
        expiresAt: 10_000,
        deliveredAt: null,
      }),
    ).toBe(true);
  });

  it('recognizes a rule staged for no session', () => {
    expect(
      isStagedRule({
        text: 'the data owner reviews migrations',
        hash: 'abc',
        sessionId: null,
        stagedAt: 100,
        expiresAt: 10_000,
        deliveredAt: null,
      }),
    ).toBe(true);
  });

  it('rejects staging that lost a field', () => {
    expect(isStagedRule({ text: 'a rule', hash: 'abc' })).toBe(false);
    expect(
      isStagedRule({
        text: 'a rule',
        hash: 'abc',
        stagedAt: 100,
        deliveredAt: null,
      }),
    ).toBe(false);
    expect(isStagedRule(null)).toBe(false);
  });

  it('rejects a staging predating the expiry contract', () => {
    expect(
      isStagedRule({
        text: 'a rule',
        hash: 'abc',
        sessionId: 'sess-1',
        stagedAt: 100,
        deliveredAt: null,
      }),
    ).toBe(false);
  });
});
