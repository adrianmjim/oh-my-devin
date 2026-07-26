import { describe, expect, it } from 'vitest';
import { STUB_SCRIPT_ENV } from './stub-script-env';

describe('STUB_SCRIPT_ENV', () => {
  it('names the variable carrying the stub script path', () => {
    expect(STUB_SCRIPT_ENV).toBe('OMD_STUB_SCRIPT');
  });
});
