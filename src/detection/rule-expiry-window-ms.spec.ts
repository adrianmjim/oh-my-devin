import { describe, expect, it } from 'vitest';
import { RULE_EXPIRY_WINDOW_MS } from './rule-expiry-window-ms';

describe('RULE_EXPIRY_WINDOW_MS', () => {
  it('bounds how long an undelivered staging stays deliverable', () => {
    expect(typeof RULE_EXPIRY_WINDOW_MS).toBe('number');
    expect(RULE_EXPIRY_WINDOW_MS).toBeGreaterThan(0);
  });
});
