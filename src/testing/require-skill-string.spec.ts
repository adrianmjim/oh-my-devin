import { describe, expect, it } from 'vitest';
import { requireSkillString } from './require-skill-string';
import { SkillFrontmatterError } from './skill-frontmatter-error';

describe('requireSkillString', () => {
  it('yields a non-empty string', () => {
    expect(requireSkillString('omd-delegate', 'name')).toBe('omd-delegate');
  });

  it('refuses an empty or non-string value, naming the field', () => {
    expect(() => requireSkillString('', 'name')).toThrow(SkillFrontmatterError);
    expect(() => requireSkillString(7, 'name')).toThrow(/name/);
  });
});
