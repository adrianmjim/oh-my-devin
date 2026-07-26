import { describe, expect, it } from 'vitest';
import { MODE_CATALOG } from './mode-catalog';
import type { ModeSkill } from './mode-skill';

describe('MODE_CATALOG', () => {
  it('declares every shipped mode skill', () => {
    expect(MODE_CATALOG.map((skill: ModeSkill): string => skill.name)).toEqual([
      'autopilot',
      'ralph',
      'team',
      'plan',
      'verify',
      'deep-dive',
    ]);
  });

  it('names each mode once', () => {
    expect(
      new Set(MODE_CATALOG.map((skill: ModeSkill): string => skill.name)).size,
    ).toBe(MODE_CATALOG.length);
  });

  it('gives every mode content', () => {
    for (const skill of MODE_CATALOG) {
      expect(skill.content.length).toBeGreaterThan(0);
    }
  });
});
