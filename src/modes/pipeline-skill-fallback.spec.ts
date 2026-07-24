import { describe, expect, it } from 'vitest';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import type { ModeSkill } from './mode-skill';
import { MODE_CATALOG } from './mode-catalog';

const PIPELINE_SKILLS: readonly string[] = ['team', 'autopilot'];

function skill(name: string): ModeSkill {
  const found: ModeSkill | undefined = MODE_CATALOG.find(
    (candidate: ModeSkill): boolean => candidate.name === name,
  );
  if (found === undefined) {
    throw new Error(`no mode "${name}" in the catalog`);
  }
  return found;
}

describe('pipeline skill fallback and synthesis directives', () => {
  it('directs the nameless/default launch when the user names no team', () => {
    for (const name of PIPELINE_SKILLS) {
      const content: string = skill(name).content;
      expect(content, name).toContain('omd team run "<task>"');
    }
  });

  it('bounds synthesis to the installed catalog via omd roles list --json', () => {
    for (const name of PIPELINE_SKILLS) {
      const content: string = skill(name).content;
      expect(content, name).toContain('omd roles list --json');
      expect(content.toLowerCase(), name).toContain('compose');
    }
  });

  it('writes synthesized declarations under .devin/teams/ and never as default', () => {
    for (const name of PIPELINE_SKILLS) {
      const content: string = skill(name).content;
      const lower: string = content.toLowerCase();
      expect(content, name).toContain('.devin/teams/');
      expect(lower, name).toContain('never name');
      expect(lower, name).toContain('never overwrite');
    }
  });

  it('derives the synthesized declaration name from the task text', () => {
    for (const name of PIPELINE_SKILLS) {
      const lower: string = skill(name).content.toLowerCase();
      expect(lower, name).toContain('derived from the task');
    }
  });

  it('reports a missing role with a creation suggestion and never authors roles', () => {
    for (const name of PIPELINE_SKILLS) {
      const lower: string = skill(name).content.toLowerCase();
      expect(lower, name).toContain('suggestion to create');
      expect(lower, name).toContain('never author');
    }
  });

  it('constrains synthesis to the fixed pipeline stages', () => {
    for (const name of PIPELINE_SKILLS) {
      const lower: string = skill(name).content.toLowerCase();
      expect(lower, name).toContain('executes only the fixed');
      expect(lower, name).toContain('composes exactly those stages');
    }
  });

  it('offers keep-or-delete at the terminal outcome and exempts the default', () => {
    for (const name of PIPELINE_SKILLS) {
      const lower: string = skill(name).content.toLowerCase();
      expect(lower, name).toContain('keep');
      expect(lower, name).toContain('delete');
      expect(lower, name).toContain('never offered for deletion');
    }
  });

  it('carries the write access the synthesis needs alongside exec', () => {
    for (const name of PIPELINE_SKILLS) {
      const frontmatter: SkillFrontmatter = parseSkillFrontmatter(
        skill(name).content,
      );
      expect(frontmatter.allowedTools, name).toContain('exec');
      expect(frontmatter.allowedTools, name).toContain('create');
      expect(frontmatter.allowedTools, name).toContain('edit');
      expect(frontmatter.permissions?.allow, name).toContain(
        'Write(.devin/teams/*.yaml)',
      );
    }
  });
});
