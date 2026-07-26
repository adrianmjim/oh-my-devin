import { describe, expect, it } from 'vitest';
import { tokenizeCommandLine } from './tokenize-command-line';

describe('tokenizeCommandLine', () => {
  it('splits a line on whitespace', () => {
    expect(tokenizeCommandLine('omd run reviewer')).toEqual([
      'omd',
      'run',
      'reviewer',
    ]);
  });

  it('keeps a quoted argument whole and unquoted', () => {
    expect(tokenizeCommandLine('omd run reviewer "ship it"')).toEqual([
      'omd',
      'run',
      'reviewer',
      'ship it',
    ]);
  });

  it('is empty for a blank line', () => {
    expect(tokenizeCommandLine('')).toEqual([]);
  });
});
