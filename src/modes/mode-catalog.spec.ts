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

  it('instructs every mode to write its state file on activation', () => {
    for (const skill of MODE_CATALOG) {
      expect(skill.content).toContain('On activation, write `.omd/mode.json`');
      expect(skill.content).toContain(`"mode": "${skill.name}"`);
      expect(skill.content).toContain('"context": ');
    }
  });

  it('names mode-appropriate verification criteria in each state file', () => {
    expect(mode('autopilot').content).toContain(
      '"verification": ["pipeline terminal outcome reported"]',
    );
    expect(mode('team').content).toContain(
      '"verification": ["pipeline terminal outcome reported"]',
    );
    expect(mode('ralph').content).toContain(
      '"verification": ["validate-repair loop reached a valid artifact or a classified failure"]',
    );
    expect(mode('plan').content).toContain(
      '"verification": ["plan artifact produced"]',
    );
    expect(mode('verify').content).toContain(
      '"verification": ["verification evidence recorded"]',
    );
  });

  it('instructs clearing the state with an empty verification array once criteria are met', () => {
    for (const skill of MODE_CATALOG) {
      if (skill.name === 'deep-dive') {
        continue;
      }
      expect(skill.content).toContain('empty `verification` array');
    }
  });

  it('gives deep-dive an empty verification array and keeps it read-only', () => {
    const deepDive: ModeSkill = mode('deep-dive');
    expect(deepDive.content).toContain('"verification": []');
    expect(deepDive.content).not.toContain('omd run');
    expect(deepDive.content).toContain('read-only');
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
