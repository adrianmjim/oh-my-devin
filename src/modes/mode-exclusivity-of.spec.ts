import { describe, expect, it } from 'vitest';
import { EXCLUSIVE_MODES } from './exclusive-modes';
import { MODE_CATALOG } from './mode-catalog';
import type { ModeExclusivity } from './mode-exclusivity';
import { modeExclusivityOf } from './mode-exclusivity-of';
import type { ModeSkill } from './mode-skill';

describe('modeExclusivityOf', () => {
  it('classes the work-driving trio as exclusive', () => {
    expect(modeExclusivityOf('autopilot')).toBe('exclusive');
    expect(modeExclusivityOf('ralph')).toBe('exclusive');
    expect(modeExclusivityOf('team')).toBe('exclusive');
  });

  it('leaves the support modes unclassed', () => {
    expect(modeExclusivityOf('plan')).toBe('unclassed');
    expect(modeExclusivityOf('verify')).toBe('unclassed');
  });

  it('classes deep-dive as stateless', () => {
    expect(modeExclusivityOf('deep-dive')).toBe('stateless');
  });

  it('classes every catalog mode', () => {
    const classed: readonly ModeExclusivity[] = MODE_CATALOG.map(
      (skill: ModeSkill): ModeExclusivity => modeExclusivityOf(skill.name),
    );

    expect(
      classed.filter(
        (value: ModeExclusivity): boolean => value === 'exclusive',
      ),
    ).toHaveLength(EXCLUSIVE_MODES.length);
    expect(classed).toHaveLength(MODE_CATALOG.length);
  });

  it('leaves an unknown mode unclassed', () => {
    expect(modeExclusivityOf('not-a-mode')).toBe('unclassed');
  });
});
