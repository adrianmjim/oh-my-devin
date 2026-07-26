import { describe, expect, it } from 'vitest';
import { isSessionBoundary } from './is-session-boundary';

describe('isSessionBoundary', () => {
  it('accepts the two session boundaries', () => {
    expect(isSessionBoundary('launch')).toBe(true);
    expect(isSessionBoundary('resume')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isSessionBoundary('start')).toBe(false);
    expect(isSessionBoundary(undefined)).toBe(false);
  });
});
