import { describe, expect, it } from 'vitest';
import { TOKEN_PATTERN } from './token-pattern';

describe('TOKEN_PATTERN', () => {
  it('captures a quoted token without its quotes', () => {
    expect([...'"ship it"'.matchAll(TOKEN_PATTERN)][0]?.[1]).toBe('ship it');
  });

  it('captures a bare token', () => {
    expect([...'run'.matchAll(TOKEN_PATTERN)][0]?.[2]).toBe('run');
  });

  it('scans globally so it can walk a whole line', () => {
    expect(TOKEN_PATTERN.flags).toContain('g');
  });
});
