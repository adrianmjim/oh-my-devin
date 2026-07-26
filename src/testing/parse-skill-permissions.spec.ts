import { describe, expect, it } from 'vitest';
import { parseSkillPermissions } from './parse-skill-permissions';
import { SkillFrontmatterError } from './skill-frontmatter-error';

describe('parseSkillPermissions', () => {
  it('is null when the skill declares no permissions', () => {
    expect(parseSkillPermissions(undefined)).toBeNull();
    expect(parseSkillPermissions(null)).toBeNull();
  });

  it('parses the allow list', () => {
    expect(parseSkillPermissions({ allow: ['Exec(omd)'] })).toEqual({
      allow: ['Exec(omd)'],
    });
  });

  it('is an empty allow list when none is declared', () => {
    expect(parseSkillPermissions({})).toEqual({ allow: [] });
  });

  it('refuses permissions that are not a mapping', () => {
    expect(() => parseSkillPermissions([])).toThrow(SkillFrontmatterError);
  });
});
