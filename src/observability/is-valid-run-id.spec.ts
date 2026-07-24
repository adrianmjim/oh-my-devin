import { describe, expect, it } from 'vitest';
import { generateRunId } from './generate-run-id';
import { isValidRunId } from './is-valid-run-id';

describe('isValidRunId', () => {
  it('accepts a generated run identity', () => {
    expect(isValidRunId(generateRunId())).toBe(true);
  });

  it('accepts a plain single-segment identity', () => {
    expect(isValidRunId('run-1.retry_2')).toBe(true);
  });

  it('rejects identities that could escape the run record root', () => {
    const unsafe: readonly string[] = [
      '',
      '.',
      '..',
      '../escape',
      'nested/run',
      'nested\\run',
      'run id',
    ];
    for (const value of unsafe) {
      expect(isValidRunId(value), JSON.stringify(value)).toBe(false);
    }
  });
});
