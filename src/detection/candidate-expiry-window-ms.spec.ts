import { describe, expect, it } from 'vitest';
import { CANDIDATE_EXPIRY_WINDOW_MS } from './candidate-expiry-window-ms';

describe('CANDIDATE_EXPIRY_WINDOW_MS', () => {
  it('bounds how long an unconfirmed candidate stays proposable', () => {
    expect(typeof CANDIDATE_EXPIRY_WINDOW_MS).toBe('number');
    expect(CANDIDATE_EXPIRY_WINDOW_MS).toBeGreaterThan(0);
  });
});
