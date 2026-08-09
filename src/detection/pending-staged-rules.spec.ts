import { describe, expect, it } from 'vitest';
import { AMBIENT_RULE_ENTRY_CAP } from '../memory/ambient-rule-entry-cap';
import { pendingStagedRules } from './pending-staged-rules';
import type { StagedRule } from './staged-rule';

function staged(
  text: string,
  deliveredAt: number | null = null,
  sessionId: string | null = 'sess-1',
): StagedRule {
  return { text, hash: text, sessionId, stagedAt: 100, deliveredAt };
}

describe('pendingStagedRules', () => {
  it('delivers a rule staged and not yet delivered', () => {
    expect(
      pendingStagedRules([staged('review migrations')], 'sess-1'),
    ).toHaveLength(1);
  });

  it('never repeats a rule while the same staging stands', () => {
    expect(
      pendingStagedRules([staged('review migrations', 900)], 'sess-1'),
    ).toEqual([]);
  });

  it('delivers nothing another session staged', () => {
    expect(
      pendingStagedRules(
        [staged('review migrations', null, 'sess-other')],
        'sess-1',
      ),
    ).toEqual([]);
  });

  it('delivers a rule no session claims to any session', () => {
    expect(
      pendingStagedRules([staged('review migrations', null, null)], 'sess-1'),
    ).toHaveLength(1);
  });

  it('delivers only unclaimed rules to a prompt naming no session', () => {
    const held: readonly StagedRule[] = [
      staged('claimed', null, 'sess-1'),
      staged('unclaimed', null, null),
    ];

    expect(
      pendingStagedRules(held, null).map(
        (entry: StagedRule): string => entry.text,
      ),
    ).toEqual(['unclaimed']);
  });

  it('bounds how many rules one injection carries', () => {
    const many: readonly StagedRule[] = Array.from(
      { length: AMBIENT_RULE_ENTRY_CAP + 2 },
      (_unused: unknown, index: number): StagedRule => staged(`rule ${index}`),
    );

    expect(pendingStagedRules(many, 'sess-1')).toHaveLength(
      AMBIENT_RULE_ENTRY_CAP,
    );
  });
});
