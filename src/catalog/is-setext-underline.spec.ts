import { describe, expect, it } from 'vitest';
import { isSetextUnderline } from './is-setext-underline';

describe('isSetextUnderline', () => {
  it('recognizes an underline of equals signs', () => {
    expect(isSetextUnderline('=========')).toBe(true);
  });

  it('recognizes an underline of dashes', () => {
    expect(isSetextUnderline('---')).toBe(true);
  });

  it('does not recognize a list item', () => {
    expect(isSetextUnderline('- an item')).toBe(false);
  });

  it('does not recognize ordinary prose', () => {
    expect(isSetextUnderline('You are the architect.')).toBe(false);
  });
});
