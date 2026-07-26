import { describe, expect, it } from 'vitest';
import { RUN_ID_ENV } from './run-id-env';

describe('RUN_ID_ENV', () => {
  it('names the environment variable carrying an inherited run id', () => {
    expect(RUN_ID_ENV).toBe('OMD_RUN_ID');
  });

  it('is namespaced to omd', () => {
    expect(RUN_ID_ENV.startsWith('OMD_')).toBe(true);
  });
});
