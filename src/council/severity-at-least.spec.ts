import { describe, expect, it } from 'vitest';
import { severityAtLeast } from './severity-at-least';

describe('severityAtLeast', () => {
  it('is true at the threshold', () => {
    expect(severityAtLeast('high', 'high')).toBe(true);
  });

  it('is true above the threshold', () => {
    expect(severityAtLeast('critical', 'high')).toBe(true);
  });

  it('is false below the threshold', () => {
    expect(severityAtLeast('medium', 'high')).toBe(false);
  });
});
