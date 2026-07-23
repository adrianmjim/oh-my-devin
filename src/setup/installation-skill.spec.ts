import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../cli/parse-cli-args';
import { extractInstructedCommands } from '../testing/extract-instructed-commands';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import { INSTALL_SKILL } from './setup-templates';

describe('the omd installation skill', () => {
  it('declares valid frontmatter naming the skill', () => {
    const frontmatter: SkillFrontmatter = parseSkillFrontmatter(INSTALL_SKILL);

    expect(frontmatter.name).toBe('omd-install');
    expect(frontmatter.description.length).toBeGreaterThan(0);
    expect(frontmatter.triggers.length).toBeGreaterThan(0);
    expect(frontmatter.allowedTools.length).toBeGreaterThan(0);
  });

  it('allows every command it instructs the session to run', () => {
    const frontmatter: SkillFrontmatter = parseSkillFrontmatter(INSTALL_SKILL);

    expect(frontmatter.permissions?.allow).toContain('Exec(omd)');
    expect(frontmatter.permissions?.allow).toContain('Exec(curl)');
    expect(frontmatter.permissions?.allow).toContain('Exec(sh)');
  });

  it('instructs only omd commands the shipped CLI accepts', () => {
    const commands: readonly (readonly string[])[] =
      extractInstructedCommands(INSTALL_SKILL);

    for (const argv of commands) {
      expect(() => parseCliArgs(argv), `omd ${argv.join(' ')}`).not.toThrow();
    }
  });

  it('reports the installed version and delegates environment checks to omd doctor', () => {
    const commands: readonly (readonly string[])[] =
      extractInstructedCommands(INSTALL_SKILL);

    expect(commands).toContainEqual(['--version']);
    expect(commands).toContainEqual(['doctor']);
  });

  it('performs the install through the inline installer when omd is absent', () => {
    expect(INSTALL_SKILL).toContain('install.sh');
    expect(INSTALL_SKILL.toLowerCase()).toContain('curl');
  });

  it('presents omd setup as the next step without instructing it to run', () => {
    const commands: readonly (readonly string[])[] =
      extractInstructedCommands(INSTALL_SKILL);

    expect(INSTALL_SKILL).toContain('omd setup');
    expect(commands).not.toContainEqual(['setup']);
  });

  it('references only the oh-my-devin and ohmydevin package names', () => {
    expect(INSTALL_SKILL).toContain('oh-my-devin');
    expect(INSTALL_SKILL).toContain('ohmydevin');
    expect(INSTALL_SKILL).not.toContain('npx omd');
    expect(INSTALL_SKILL).not.toContain('-g omd');
    expect(INSTALL_SKILL).not.toContain('install omd');
  });
});
