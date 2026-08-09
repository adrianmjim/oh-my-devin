import { AMBIENT_RULE_ENTRY_CAP } from '../memory/ambient-rule-entry-cap';
import type { StagedRule } from './staged-rule';

export function pendingStagedRules(
  staged: readonly StagedRule[],
  sessionId: string | null,
): readonly StagedRule[] {
  return staged
    .filter(
      (rule: StagedRule): boolean =>
        rule.deliveredAt === null &&
        (rule.sessionId === null || rule.sessionId === sessionId),
    )
    .slice(0, AMBIENT_RULE_ENTRY_CAP);
}
