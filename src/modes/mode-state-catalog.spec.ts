import { describe, expect, it } from 'vitest';
import { MODE_CATALOG } from './mode-catalog';
import type { ModeSkill } from './mode-skill';
import { MODE_STATE_CATALOG } from './mode-state-catalog';

describe('MODE_STATE_CATALOG', () => {
  it('resolves each mode name to its state', () => {
    expect(MODE_STATE_CATALOG.get('ralph')?.mode).toBe('ralph');
  });

  it('has no state for an unknown mode', () => {
    expect(MODE_STATE_CATALOG.get('nonsense')).toBeUndefined();
  });

  it('keys every state by the mode it declares', () => {
    for (const [key, state] of MODE_STATE_CATALOG) {
      expect(state.mode).toBe(key);
    }
  });

  it('carries a state for every mode skill that sets one', () => {
    const settable: readonly string[] = MODE_CATALOG.filter(
      (skill: ModeSkill): boolean => MODE_STATE_CATALOG.has(skill.name),
    ).map((skill: ModeSkill): string => skill.name);

    expect(settable.length).toBe(MODE_STATE_CATALOG.size);
  });
});
