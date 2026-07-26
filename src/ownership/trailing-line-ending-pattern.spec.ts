import { describe, expect, it } from 'vitest';
import { TRAILING_LINE_ENDING_PATTERN } from './trailing-line-ending-pattern';

describe('TRAILING_LINE_ENDING_PATTERN', () => {
  it('matches a trailing newline', () => {
    expect('body\n'.replace(TRAILING_LINE_ENDING_PATTERN, '')).toBe('body');
  });

  it('matches a trailing carriage return and newline', () => {
    expect('body\r\n'.replace(TRAILING_LINE_ENDING_PATTERN, '')).toBe('body');
  });

  it('leaves interior newlines alone', () => {
    expect('a\nb'.replace(TRAILING_LINE_ENDING_PATTERN, '')).toBe('a\nb');
  });
});
