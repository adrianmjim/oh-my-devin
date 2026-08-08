import { describe, expect, it } from 'vitest';
import { AMBIENT_RULE_ENTRY_CAP } from '../memory/ambient-rule-entry-cap';
import { pendingStagedRules } from './pending-staged-rules';
import type { StagedRule } from './staged-rule';

function staged(text: string, deliveredAt: number | null = null): StagedRule {
  return { text, hash: text, stagedAt: 100, deliveredAt };
}

describe('pendingStagedRules', () => {
  it('delivers a rule staged and not yet delivered', () => {
    expect(pendingStagedRules([staged('review migrations')])).toHaveLength(1);
  });

  it('never repeats a rule while the same staging stands', () => {
    expect(pendingStagedRules([staged('review migrations', 900)])).toEqual([]);
  });

  it('bounds how many rules one injection carries', () => {
    const many: readonly StagedRule[] = Array.from(
      { length: AMBIENT_RULE_ENTRY_CAP + 2 },
      (_unused: unknown, index: number): StagedRule => staged(`rule ${index}`),
    );

    expect(pendingStagedRules(many)).toHaveLength(AMBIENT_RULE_ENTRY_CAP);
  });
});
