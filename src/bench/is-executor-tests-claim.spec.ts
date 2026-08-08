import { describe, expect, it } from 'vitest';
import { isExecutorTestsClaim } from './is-executor-tests-claim';

describe('isExecutorTestsClaim', () => {
  it('accepts the test claims the executor schema allows', () => {
    expect(isExecutorTestsClaim('passed')).toBe(true);
    expect(isExecutorTestsClaim('failed')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isExecutorTestsClaim('skipped')).toBe(false);
    expect(isExecutorTestsClaim(false)).toBe(false);
  });
});
