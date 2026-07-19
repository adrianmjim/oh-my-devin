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

  it('instructs every stateful mode to set its state through the CLI on activation', () => {
    for (const skill of MODE_CATALOG) {
      if (skill.name === 'deep-dive') {
        continue;
      }
      expect(skill.content).toContain('On activation, run:');
      expect(skill.content).toContain(`omd mode set ${skill.name}`);
    }
  });

  it('instructs every stateful mode to clear its state through the CLI once criteria are met', () => {
    for (const skill of MODE_CATALOG) {
      if (skill.name === 'deep-dive') {
        continue;
      }
      expect(skill.content).toContain('Once the criteria are met, run:');
      expect(skill.content).toContain('omd mode clear');
    }
  });

  it('never instructs writing the state file directly', () => {
    for (const skill of MODE_CATALOG) {
      expect(skill.content).not.toContain('.omd/mode.json');
    }
  });

  it('keeps deep-dive stateless and read-only', () => {
    const deepDive: ModeSkill = mode('deep-dive');
    expect(deepDive.content).not.toContain('omd mode');
    expect(deepDive.content).not.toContain('omd run');
    expect(deepDive.content).toContain('read-only');
    expect(deepDive.content).toContain('- read');
    expect(deepDive.content).toContain('- grep');
    expect(deepDive.content).not.toContain('- exec');
    expect(deepDive.lane).toBe('conversational');
  });

  it('gives each mode a SKILL.md front matter naming the mode', () => {
    for (const skill of MODE_CATALOG) {
      expect(skill.content.startsWith('---\n')).toBe(true);
      expect(skill.content).toContain(`name: ${skill.name}`);
      expect(skill.content).toContain('description:');
    }
  });
});
