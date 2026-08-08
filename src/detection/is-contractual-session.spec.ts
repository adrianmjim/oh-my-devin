import { describe, expect, it } from 'vitest';
import { RUN_ID_ENV } from '../observability/run-id-env';
import { isContractualSession } from './is-contractual-session';

describe('isContractualSession', () => {
  it('reads a session carrying a run record identity as contractual', () => {
    expect(isContractualSession({ [RUN_ID_ENV]: 'run-7' })).toBe(true);
  });

  it('reads a session with no run record identity as conversational', () => {
    expect(isContractualSession({})).toBe(false);
    expect(isContractualSession({ [RUN_ID_ENV]: '   ' })).toBe(false);
  });
});
