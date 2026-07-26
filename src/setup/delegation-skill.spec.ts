import { describe, expect, it } from 'vitest';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import { DELEGATION_SKILL } from './delegation-skill';

describe('DELEGATION_SKILL', () => {
  it('declares valid frontmatter naming the delegation skill', () => {
    const frontmatter: SkillFrontmatter =
      parseSkillFrontmatter(DELEGATION_SKILL);

    expect(frontmatter.name).toBe('omd-delegate');
    expect(frontmatter.description.length).toBeGreaterThan(0);
    expect(frontmatter.triggers.length).toBeGreaterThan(0);
  });

  it('instructs the correspondent to launch the run detached', () => {
    expect(DELEGATION_SKILL).toContain('omd run <role> "<task>" --detach');
  });

  it('instructs the correspondent to narrate from status snapshots only', () => {
    expect(DELEGATION_SKILL).toContain('omd status <run-id> --json');
    expect(DELEGATION_SKILL).toContain('the snapshot is the only channel');
  });

  it('forbids actuating a gate decision from the conversation', () => {
    expect(DELEGATION_SKILL).toContain('Never actuate a gate decision');
  });
});
