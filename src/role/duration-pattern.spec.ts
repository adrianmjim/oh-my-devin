import { describe, expect, it } from 'vitest';
import { DURATION_PATTERN } from './duration-pattern';

describe('DURATION_PATTERN', () => {
  it('captures the amount and its unit', () => {
    const match: RegExpExecArray | null = DURATION_PATTERN.exec('30m');

    expect(match?.[1]).toBe('30');
    expect(match?.[2]).toBe('m');
  });

  it('accepts a bare amount with no unit', () => {
    const match: RegExpExecArray | null = DURATION_PATTERN.exec('1500');

    expect(match?.[1]).toBe('1500');
    expect(match?.[2]).toBeUndefined();
  });

  it('rejects an unknown unit or a non-numeric amount', () => {
    expect(DURATION_PATTERN.exec('30d')).toBeNull();
    expect(DURATION_PATTERN.exec('half an hour')).toBeNull();
  });
});
