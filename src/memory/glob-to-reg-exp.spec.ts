import { describe, expect, it } from 'vitest';
import { globToRegExp } from './glob-to-reg-exp';

describe('globToRegExp', () => {
  it('reads a trailing double star as every path below', () => {
    const pattern: RegExp = globToRegExp('db/migrations/**');

    expect(pattern.test('db/migrations/001.sql')).toBe(true);
    expect(pattern.test('db/migrations/2026/001.sql')).toBe(true);
    expect(pattern.test('db/schema.sql')).toBe(false);
  });

  it('reads a leading double star as any directory, including none', () => {
    const pattern: RegExp = globToRegExp('**/*.md');

    expect(pattern.test('readme.md')).toBe(true);
    expect(pattern.test('docs/guides/readme.md')).toBe(true);
    expect(pattern.test('readme.txt')).toBe(false);
  });

  it('holds a single star inside one path segment', () => {
    const pattern: RegExp = globToRegExp('src/*.ts');

    expect(pattern.test('src/index.ts')).toBe(true);
    expect(pattern.test('src/memory/index.ts')).toBe(false);
  });

  it('reads a question mark as one character inside a segment', () => {
    const pattern: RegExp = globToRegExp('v?.json');

    expect(pattern.test('v1.json')).toBe(true);
    expect(pattern.test('v10.json')).toBe(false);
  });

  it('reads the rest of the glob as text, never as a pattern', () => {
    const pattern: RegExp = globToRegExp('docs/a.b');

    expect(pattern.test('docs/a.b')).toBe(true);
    expect(pattern.test('docs/axb')).toBe(false);
  });

  it('anchors the whole path', () => {
    const pattern: RegExp = globToRegExp('AGENTS.md');

    expect(pattern.test('AGENTS.md')).toBe(true);
    expect(pattern.test('docs/AGENTS.md')).toBe(false);
  });
});
