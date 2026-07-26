import { describe, expect, it } from 'vitest';
import { DENY_SIGNALS } from './deny-signals';

describe('DENY_SIGNALS', () => {
  it('recognizes a user rejection of a tool', () => {
    expect(
      DENY_SIGNALS.some((pattern: RegExp): boolean =>
        pattern.test('A tool was rejected by the user'),
      ),
    ).toBe(true);
  });

  it('recognizes a deny-rule rejection in any of its wordings', () => {
    for (const line of [
      'rejected by deny rule',
      'rejected by a deny rule',
      'rejected by the deny rule',
    ]) {
      expect(
        DENY_SIGNALS.some((pattern: RegExp): boolean => pattern.test(line)),
      ).toBe(true);
    }
  });

  it('ignores an unrelated failure', () => {
    expect(
      DENY_SIGNALS.some((pattern: RegExp): boolean =>
        pattern.test('network unreachable'),
      ),
    ).toBe(false);
  });
});
