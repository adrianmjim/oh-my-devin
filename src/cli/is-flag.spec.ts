import { describe, expect, it } from 'vitest';
import { isFlag } from './is-flag';

describe('isFlag', () => {
  it('recognizes a long flag', () => {
    expect(isFlag('--json')).toBe(true);
  });

  it('recognizes an inline flag assignment', () => {
    expect(isFlag('--scope=skills')).toBe(true);
  });

  it('rejects a positional argument', () => {
    expect(isFlag('reviewer')).toBe(false);
  });

  it('rejects an argument that only contains dashes later on', () => {
    expect(isFlag('assess the --json diff')).toBe(false);
  });

  it('rejects the empty argument', () => {
    expect(isFlag('')).toBe(false);
  });
});
