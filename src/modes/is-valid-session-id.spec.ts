import { describe, expect, it } from 'vitest';
import { isValidSessionId } from './is-valid-session-id';

describe('isValidSessionId', () => {
  it('accepts an engine session id', () => {
    expect(isValidSessionId('0199f2a1-4c3b-7e2d-8a91-6f0b2c4d5e6f')).toBe(true);
  });

  it('rejects an id that would escape the mode-state root', () => {
    expect(isValidSessionId('..')).toBe(false);
    expect(isValidSessionId('.')).toBe(false);
    expect(isValidSessionId('a/b')).toBe(false);
    expect(isValidSessionId('')).toBe(false);
  });
});
