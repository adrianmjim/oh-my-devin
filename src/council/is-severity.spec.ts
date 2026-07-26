import { describe, expect, it } from 'vitest';
import { isSeverity } from './is-severity';
import { SEVERITY_ORDER } from './severity-order';

describe('isSeverity', () => {
  it('accepts every declared severity', () => {
    for (const severity of SEVERITY_ORDER) {
      expect(isSeverity(severity)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isSeverity('urgent')).toBe(false);
    expect(isSeverity(2)).toBe(false);
    expect(isSeverity(null)).toBe(false);
  });
});
