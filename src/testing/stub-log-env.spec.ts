import { describe, expect, it } from 'vitest';
import { STUB_LOG_ENV } from './stub-log-env';

describe('STUB_LOG_ENV', () => {
  it('names the variable carrying the stub invocation log path', () => {
    expect(STUB_LOG_ENV).toBe('OMD_STUB_LOG');
  });
});
