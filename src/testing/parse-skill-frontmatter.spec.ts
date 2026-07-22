import { describe, expect, it } from 'vitest';
import { parseSkillFrontmatter } from './parse-skill-frontmatter';
import { SkillFrontmatterError } from './skill-frontmatter-error';
import type { SkillFrontmatter } from './skill-frontmatter';

const CONTRACTUAL_SKILL: string = [
  '---',
  'name: omd-delegate',
  'description: Delegate a task to a named omd role via the contractual lane.',
  'triggers:',
  '  - model',
  'allowed-tools:',
  '  - exec',
  'permissions:',
  '  allow:',
  '    - "Exec(omd)"',
  '---',
  '',
  'When the user asks to delegate work to a named role, run:',
  '',
  '    omd run <role> "<task>"',
  '',
].join('\n');

const CONVERSATIONAL_SKILL: string = [
  '---',
  'name: deep-dive',
  'description: Read-only exploration of the codebase (conversational lane).',
  'triggers:',
  '  - model',
  'allowed-tools:',
  '  - read',
  '  - grep',
  '---',
  '',
  'When the user asks to explore or understand code, work read-only.',
  '',
].join('\n');

describe('parseSkillFrontmatter', () => {
  it('yields the typed frontmatter shape for a contractual-lane skill', () => {
    const frontmatter: SkillFrontmatter =
      parseSkillFrontmatter(CONTRACTUAL_SKILL);

    expect(frontmatter.name).toBe('omd-delegate');
    expect(frontmatter.description).toBe(
      'Delegate a task to a named omd role via the contractual lane.',
    );
    expect(frontmatter.triggers).toEqual(['model']);
    expect(frontmatter.allowedTools).toEqual(['exec']);
    expect(frontmatter.permissions).not.toBeNull();
    expect(frontmatter.permissions?.allow).toEqual(['Exec(omd)']);
  });

  it('reports absent permissions as null', () => {
    const frontmatter: SkillFrontmatter =
      parseSkillFrontmatter(CONVERSATIONAL_SKILL);

    expect(frontmatter.name).toBe('deep-dive');
    expect(frontmatter.allowedTools).toEqual(['read', 'grep']);
    expect(frontmatter.permissions).toBeNull();
  });

  it('rejects a skill with no frontmatter block', () => {
    expect(() => parseSkillFrontmatter('no frontmatter here')).toThrow(
      SkillFrontmatterError,
    );
  });

  it('rejects frontmatter that is not a mapping', () => {
    const notAMapping: string = ['---', '- a', '- b', '---', '', 'body'].join(
      '\n',
    );

    expect(() => parseSkillFrontmatter(notAMapping)).toThrow(
      SkillFrontmatterError,
    );
  });

  it('rejects frontmatter missing the required name', () => {
    const noName: string = [
      '---',
      'description: A skill without a name.',
      '---',
      '',
      'body',
    ].join('\n');

    expect(() => parseSkillFrontmatter(noName)).toThrow(SkillFrontmatterError);
  });

  it('rejects frontmatter missing the required description', () => {
    const noDescription: string = [
      '---',
      'name: nameless',
      '---',
      '',
      'body',
    ].join('\n');

    expect(() => parseSkillFrontmatter(noDescription)).toThrow(
      SkillFrontmatterError,
    );
  });

  it('rejects an empty string inside a string list', () => {
    const emptyTrigger: string = [
      '---',
      'name: broken',
      'description: A skill with an empty trigger.',
      'triggers:',
      '  - ""',
      '---',
      '',
      'body',
    ].join('\n');

    expect(() => parseSkillFrontmatter(emptyTrigger)).toThrow(
      SkillFrontmatterError,
    );
  });

  it('wraps malformed YAML in a SkillFrontmatterError', () => {
    const malformed: string = [
      '---',
      'name: broken',
      'triggers: [unclosed',
      '---',
      '',
      'body',
    ].join('\n');

    expect(() => parseSkillFrontmatter(malformed)).toThrow(
      SkillFrontmatterError,
    );
  });
});
