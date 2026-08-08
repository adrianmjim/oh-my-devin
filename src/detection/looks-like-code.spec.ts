import { describe, expect, it } from 'vitest';
import { looksLikeCode } from './looks-like-code';

describe('looksLikeCode', () => {
  it('recognizes a fenced or quoted snippet', () => {
    expect(looksLikeCode('run `pnpm lint` before pushing')).toBe(true);
    expect(looksLikeCode('```ts')).toBe(true);
  });

  it('recognizes source punctuation a principle never carries', () => {
    expect(looksLikeCode('const gate = () => true;')).toBe(true);
    expect(looksLikeCode('if (x) { return y }')).toBe(true);
  });

  it('accepts prose stating a principle', () => {
    expect(looksLikeCode('always run the linter before pushing to main')).toBe(
      false,
    );
  });
});
