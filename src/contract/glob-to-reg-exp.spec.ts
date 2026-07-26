import { describe, expect, it } from 'vitest';
import { globToRegExp } from './glob-to-reg-exp';

describe('globToRegExp', () => {
  it('matches a literal path', () => {
    expect(globToRegExp('review.json').test('review.json')).toBe(true);
    expect(globToRegExp('review.json').test('xreview.json')).toBe(false);
  });

  it('lets a single star span one segment only', () => {
    expect(globToRegExp('src/*.ts').test('src/a.ts')).toBe(true);
    expect(globToRegExp('src/*.ts').test('src/nested/a.ts')).toBe(false);
  });

  it('lets a double star span segments', () => {
    expect(globToRegExp('src/**.ts').test('src/nested/a.ts')).toBe(true);
  });

  it('matches a single character with a question mark', () => {
    expect(globToRegExp('a?.ts').test('ab.ts')).toBe(true);
    expect(globToRegExp('a?.ts').test('a/b.ts')).toBe(false);
  });

  it('escapes the regular-expression metacharacters of a literal', () => {
    expect(globToRegExp('a+b.ts').test('a+b.ts')).toBe(true);
    expect(globToRegExp('a+b.ts').test('aab.ts')).toBe(false);
  });

  it('anchors so a pattern never matches a longer path', () => {
    expect(globToRegExp('a.ts').test('dir/a.ts')).toBe(false);
  });
});
