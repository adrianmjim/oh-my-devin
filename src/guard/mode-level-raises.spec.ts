import { describe, expect, it } from 'vitest';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeSkill } from '../modes/mode-skill';
import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';
import { MODE_LEVEL_RAISES } from './mode-level-raises';

describe('MODE_LEVEL_RAISES', () => {
  it('raises autopilot to strict', () => {
    expect(MODE_LEVEL_RAISES.get('autopilot')).toBe('strict');
  });

  it('raises no other shipped mode', () => {
    expect([...MODE_LEVEL_RAISES.keys()]).toEqual(['autopilot']);
    expect(MODE_LEVEL_RAISES.get('ralph')).toBeUndefined();
    expect(MODE_LEVEL_RAISES.get('team')).toBeUndefined();
  });

  it('names only modes the catalog ships and levels of the ladder', () => {
    const known: readonly string[] = MODE_CATALOG.map(
      (skill: ModeSkill): string => skill.name,
    );
    for (const [mode, level] of MODE_LEVEL_RAISES) {
      expect(known).toContain(mode);
      expect(ALL_ENFORCEMENT_LEVELS).toContain(level);
    }
  });
});
