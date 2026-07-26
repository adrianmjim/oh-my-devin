import { describe, expect, it } from 'vitest';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import { RALPH_SKILL } from './ralph-skill';

describe('RALPH_SKILL', () => {
  it('declares frontmatter naming the skill', () => {
    const frontmatter: SkillFrontmatter = parseSkillFrontmatter(RALPH_SKILL);

    expect(frontmatter.name.length).toBeGreaterThan(0);
    expect(frontmatter.description.length).toBeGreaterThan(0);
  });

  it('carries instructions below its frontmatter', () => {
    expect(RALPH_SKILL.split('---').length).toBeGreaterThan(2);
  });
});
