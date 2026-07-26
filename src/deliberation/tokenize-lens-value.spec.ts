import { describe, expect, it } from 'vitest';
import { tokenizeLensValue } from './tokenize-lens-value';

describe('tokenizeLensValue', () => {
  it('lowercases and splits on non-alphanumeric runs', () => {
    expect(tokenizeLensValue('Auth Token-Leak')).toEqual([
      'auth',
      'token',
      'leak',
    ]);
  });

  it('drops empty tokens from leading and trailing separators', () => {
    expect(tokenizeLensValue('  auth  ')).toEqual(['auth']);
  });

  it('is empty for a value with no alphanumeric content', () => {
    expect(tokenizeLensValue('---')).toEqual([]);
  });
});
