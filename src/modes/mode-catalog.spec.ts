import { describe, expect, it } from 'vitest';
import type { ModeSkill } from './mode-skill';
import { MODE_CATALOG } from './mode-catalog';

function mode(name: string): ModeSkill {
  const found: ModeSkill | undefined = MODE_CATALOG.find(
    (skill: ModeSkill): boolean => skill.name === name,
  );
  if (found === undefined) {
    throw new Error(`no mode "${name}" in the catalog`);
  }
  return found;
}

describe('MODE_CATALOG', () => {
  it('is closed to exactly the six named modes', () => {
    expect(
      [...MODE_CATALOG.map((skill: ModeSkill): string => skill.name)].sort(),
    ).toEqual(['autopilot', 'deep-dive', 'plan', 'ralph', 'team', 'verify']);
  });

  it('delegates the team and autopilot modes to the pipeline', () => {
    expect(mode('team').delegatesTo).toBe('pipeline');
    expect(mode('team').content).toContain('omd team run');
    expect(mode('autopilot').delegatesTo).toBe('pipeline');
    expect(mode('autopilot').content).toContain('omd team run');
  });

  it('delegates the ralph mode to omd run and its validate-repair loop', () => {
    expect(mode('ralph').delegatesTo).toBe('omd-run');
    expect(mode('ralph').content).toContain('omd run');
    expect(mode('ralph').content).toContain('validate-repair');
  });

  it('keeps deep-dive in the conversational lane with no omd run delegation', () => {
    const deepDive: ModeSkill = mode('deep-dive');
    expect(deepDive.lane).toBe('conversational');
    expect(deepDive.delegatesTo).toBe('none');
    expect(deepDive.content).not.toContain('omd run');
  });

  it('gives each mode a SKILL.md front matter naming the mode', () => {
    for (const skill of MODE_CATALOG) {
      expect(skill.content.startsWith('---\n')).toBe(true);
      expect(skill.content).toContain(`name: ${skill.name}`);
      expect(skill.content).toContain('description:');
    }
  });
});
