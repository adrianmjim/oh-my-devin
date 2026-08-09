import { describe, expect, it } from 'vitest';
import { markRulesDelivered } from './mark-rules-delivered';
import type { StagedRule } from './staged-rule';

function staged(
  text: string,
  deliveredAt: number | null = null,
  sessionId: string | null = 'sess-1',
): StagedRule {
  return { text, hash: text, sessionId, stagedAt: 100, deliveredAt };
}

describe('markRulesDelivered', () => {
  it('marks exactly the rules that were delivered', () => {
    const marked: readonly StagedRule[] = markRulesDelivered(
      [staged('delivered now'), staged('still waiting')],
      [staged('delivered now')],
      1_500,
    );

    expect(marked[0]?.deliveredAt).toBe(1_500);
    expect(marked[1]?.deliveredAt).toBeNull();
  });

  it('leaves the same rule staged by another session pending', () => {
    const marked: readonly StagedRule[] = markRulesDelivered(
      [staged('shared', null, 'sess-1'), staged('shared', null, 'sess-other')],
      [staged('shared', null, 'sess-1')],
      1_500,
    );

    expect(marked[0]?.deliveredAt).toBe(1_500);
    expect(marked[1]?.deliveredAt).toBeNull();
  });

  it('leaves an earlier delivery stamp standing', () => {
    expect(
      markRulesDelivered([staged('sent', 900)], [staged('sent')], 1_500)[0]
        ?.deliveredAt,
    ).toBe(900);
  });
});
