import { describe, expect, it } from 'vitest';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import { TEAM_SKILL } from './team-skill';

describe('TEAM_SKILL', () => {
  it('declares frontmatter naming the skill', () => {
    const frontmatter: SkillFrontmatter = parseSkillFrontmatter(TEAM_SKILL);

    expect(frontmatter.name.length).toBeGreaterThan(0);
    expect(frontmatter.description.length).toBeGreaterThan(0);
  });

  it('carries instructions below its frontmatter', () => {
    expect(TEAM_SKILL.split('---').length).toBeGreaterThan(2);
  });
});
