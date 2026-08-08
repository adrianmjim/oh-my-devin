import type { StagedRule } from './staged-rule';

export function markRulesDelivered(
  staged: readonly StagedRule[],
  texts: readonly string[],
  now: number,
): readonly StagedRule[] {
  return staged.map((rule: StagedRule): StagedRule =>
    rule.deliveredAt === null && texts.includes(rule.text)
      ? { ...rule, deliveredAt: now }
      : rule,
  );
}
