import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../cli/parse-cli-args';
import { DELEGATION_SKILL } from '../setup/setup-templates';
import { extractInstructedCommands } from '../testing/extract-instructed-commands';
import { parseSkillFrontmatter } from '../testing/parse-skill-frontmatter';
import type { SkillFrontmatter } from '../testing/skill-frontmatter';
import type { ModeDelegation } from './mode-delegation';
import type { ModeLane } from './mode-lane';
import { MODE_CATALOG } from './mode-catalog';

interface EmittedSkill {
  readonly name: string;
  readonly lane: ModeLane;
  readonly content: string;
}

interface ExpectedMode {
  readonly lane: ModeLane;
  readonly delegatesTo: ModeDelegation;
}

const EMITTED_SKILLS: readonly EmittedSkill[] = [
  { name: 'omd-delegate', lane: 'contractual', content: DELEGATION_SKILL },
  ...MODE_CATALOG,
];

const NON_NORMATIVE_MODES: ReadonlySet<string> = new Set(['plan', 'verify']);

function emitted(name: string): EmittedSkill {
  const found: EmittedSkill | undefined = EMITTED_SKILLS.find(
    (skill: EmittedSkill): boolean => skill.name === name,
  );
  if (found === undefined) {
    throw new Error(`no emitted skill "${name}"`);
  }
  return found;
}

describe('emitted skill verification', () => {
  it('parses valid frontmatter for every emitted skill, naming the skill', () => {
    for (const skill of EMITTED_SKILLS) {
      const frontmatter: SkillFrontmatter = parseSkillFrontmatter(
        skill.content,
      );
      expect(frontmatter.name).toBe(skill.name);
      expect(frontmatter.description.length).toBeGreaterThan(0);
      expect(frontmatter.triggers.length).toBeGreaterThan(0);
      expect(frontmatter.allowedTools.length, skill.name).toBeGreaterThan(0);
    }
  });

  it('carries the Exec(omd) allowance on every contractual-lane skill', () => {
    for (const skill of EMITTED_SKILLS) {
      if (skill.lane !== 'contractual') {
        continue;
      }
      const frontmatter: SkillFrontmatter = parseSkillFrontmatter(
        skill.content,
      );
      expect(frontmatter.permissions?.allow, skill.name).toContain('Exec(omd)');
    }
  });

  it('keeps the conversational deep-dive skill free of the Exec(omd) allowance', () => {
    const frontmatter: SkillFrontmatter = parseSkillFrontmatter(
      emitted('deep-dive').content,
    );
    expect(frontmatter.permissions).toBeNull();
  });

  it('emits exactly omd-delegate plus the six catalog modes', () => {
    expect(
      EMITTED_SKILLS.map((skill: EmittedSkill): string => skill.name).sort(),
    ).toEqual([
      'autopilot',
      'deep-dive',
      'omd-delegate',
      'plan',
      'ralph',
      'team',
      'verify',
    ]);
  });

  it('keeps each mode lane and delegation target consistent with the catalog', () => {
    const expectedModes: Record<string, ExpectedMode> = {
      autopilot: { lane: 'contractual', delegatesTo: 'pipeline' },
      ralph: { lane: 'contractual', delegatesTo: 'omd-run' },
      team: { lane: 'contractual', delegatesTo: 'pipeline' },
      plan: { lane: 'contractual', delegatesTo: 'omd-run' },
      verify: { lane: 'contractual', delegatesTo: 'omd-run' },
      'deep-dive': { lane: 'conversational', delegatesTo: 'none' },
    };
    for (const skill of MODE_CATALOG) {
      const want: ExpectedMode | undefined = expectedModes[skill.name];
      expect(want, skill.name).toBeDefined();
      expect(skill.lane).toBe(want?.lane);
      expect(skill.delegatesTo).toBe(want?.delegatesTo);
      expect(parseSkillFrontmatter(skill.content).name).toBe(skill.name);
    }
  });

  it('instructs only omd commands the shipped CLI accepts', () => {
    for (const skill of EMITTED_SKILLS) {
      for (const argv of extractInstructedCommands(skill.content)) {
        expect(
          () => parseCliArgs(argv),
          `${skill.name}: omd ${argv.join(' ')}`,
        ).not.toThrow();
      }
    }
  });

  it('instructs plan and verify to set and clear their mode through the CLI', () => {
    for (const name of NON_NORMATIVE_MODES) {
      const commands: readonly (readonly string[])[] =
        extractInstructedCommands(emitted(name).content);
      expect(commands).toContainEqual(['mode', 'set', name]);
      expect(commands).toContainEqual(['mode', 'clear']);
      expect(() => parseCliArgs(['mode', 'set', name])).not.toThrow();
      expect(() => parseCliArgs(['mode', 'clear'])).not.toThrow();
    }
  });

  it('instructs no contractual command from the read-only deep-dive skill', () => {
    expect(extractInstructedCommands(emitted('deep-dive').content)).toEqual([]);
  });
});
