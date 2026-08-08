import { describe, expect, it } from 'vitest';
import { EXCLUSIVE_MODES } from './exclusive-modes';
import { MODE_CATALOG } from './mode-catalog';
import type { ModeSkill } from './mode-skill';
import { STATELESS_MODES } from './stateless-modes';
import { UNCLASSED_MODES } from './unclassed-modes';

describe('mode exclusivity classes', () => {
  it('partitions the mode catalog', () => {
    const classed: readonly string[] = [
      ...EXCLUSIVE_MODES,
      ...UNCLASSED_MODES,
      ...STATELESS_MODES,
    ];
    const catalog: readonly string[] = MODE_CATALOG.map(
      (skill: ModeSkill): string => skill.name,
    );

    expect([...classed].sort()).toEqual([...catalog].sort());
  });

  it('classes every mode exactly once', () => {
    const classed: readonly string[] = [
      ...EXCLUSIVE_MODES,
      ...UNCLASSED_MODES,
      ...STATELESS_MODES,
    ];

    expect(new Set(classed).size).toBe(classed.length);
  });
});
