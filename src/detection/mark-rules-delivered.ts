import type { StagedRule } from './staged-rule';

export function markRulesDelivered(
  staged: readonly StagedRule[],
  delivered: readonly StagedRule[],
  now: number,
): readonly StagedRule[] {
  return staged.map((rule: StagedRule): StagedRule =>
    rule.deliveredAt === null &&
    delivered.some(
      (entry: StagedRule): boolean =>
        entry.hash === rule.hash && entry.sessionId === rule.sessionId,
    )
      ? { ...rule, deliveredAt: now }
      : rule,
  );
}
