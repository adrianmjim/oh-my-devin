import { describe, expect, it } from 'vitest';
import { isInteractiveSession } from './is-interactive-session';

describe('isInteractiveSession', () => {
  it('is interactive when both streams are terminals', () => {
    expect(isInteractiveSession(true, true)).toBe(true);
  });

  it('is not interactive when the input stream is not a terminal', () => {
    expect(isInteractiveSession(false, true)).toBe(false);
  });

  it('is not interactive when the output stream is not a terminal', () => {
    expect(isInteractiveSession(true, false)).toBe(false);
  });

  it('is not interactive when neither stream is a terminal', () => {
    expect(isInteractiveSession(false, false)).toBe(false);
  });

  it('returns false, not undefined, for the values a piped run reports', () => {
    expect(isInteractiveSession(undefined, undefined)).toBe(false);
  });

  it('returns false when only the input flag is undefined', () => {
    expect(isInteractiveSession(undefined, true)).toBe(false);
  });

  it('returns false when only the output flag is undefined', () => {
    expect(isInteractiveSession(true, undefined)).toBe(false);
  });
});
