import { describe, expect, it } from 'vitest';
import { optionalStringArray } from './optional-string-array';
import { SkillFrontmatterError } from './skill-frontmatter-error';

describe('optionalStringArray', () => {
  it('is empty when the field is absent', () => {
    expect(optionalStringArray(undefined, 'triggers')).toEqual([]);
    expect(optionalStringArray(null, 'triggers')).toEqual([]);
  });

  it('yields the declared strings', () => {
    expect(optionalStringArray(['model'], 'triggers')).toEqual(['model']);
  });

  it('refuses a value that is not a list', () => {
    expect(() => optionalStringArray('model', 'triggers')).toThrow(
      SkillFrontmatterError,
    );
  });

  it('refuses an empty entry, naming its index', () => {
    expect(() => optionalStringArray(['  '], 'triggers')).toThrow(
      /triggers\[0\]/,
    );
  });
});
