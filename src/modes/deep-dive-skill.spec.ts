import { describe, expect, it } from 'vitest';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import { DEEP_DIVE_SKILL } from './deep-dive-skill';

describe('DEEP_DIVE_SKILL', () => {
  it('declares frontmatter naming the skill', () => {
    const frontmatter: SkillFrontmatter =
      parseSkillFrontmatter(DEEP_DIVE_SKILL);

    expect(frontmatter.name.length).toBeGreaterThan(0);
    expect(frontmatter.description.length).toBeGreaterThan(0);
  });

  it('carries instructions below its frontmatter', () => {
    expect(DEEP_DIVE_SKILL.split('---').length).toBeGreaterThan(2);
  });
});
