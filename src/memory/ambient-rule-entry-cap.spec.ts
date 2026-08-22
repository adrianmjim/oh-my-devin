import { describe, expect, it } from 'vitest';
import { AMBIENT_RULE_ENTRY_CAP } from './ambient-rule-entry-cap';

describe('AMBIENT_RULE_ENTRY_CAP', () => {
  it('bounds how many staged rules one injection carries', () => {
    expect(typeof AMBIENT_RULE_ENTRY_CAP).toBe('number');
    expect(AMBIENT_RULE_ENTRY_CAP).toBeGreaterThan(0);
    expect(Number.isInteger(AMBIENT_RULE_ENTRY_CAP)).toBe(true);
  });
});
