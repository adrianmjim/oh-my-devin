import { describe, expect, it } from 'vitest';
import { PROFILE_STALENESS_WINDOW_MS } from './profile-staleness-window-ms';

describe('PROFILE_STALENESS_WINDOW_MS', () => {
  it('refreshes the cached snapshot once a day passes', () => {
    expect(PROFILE_STALENESS_WINDOW_MS).toBe(86400000);
  });

  it('is a positive whole number of milliseconds', () => {
    expect(Number.isInteger(PROFILE_STALENESS_WINDOW_MS)).toBe(true);
    expect(PROFILE_STALENESS_WINDOW_MS).toBeGreaterThan(0);
  });
});
