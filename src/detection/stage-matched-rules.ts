import { matchRules } from '../memory/match-rules';
import type { RuleEntry } from '../memory/rule-entry';
import { RULE_EXPIRY_WINDOW_MS } from './rule-expiry-window-ms';
import type { StagedRule } from './staged-rule';

export function stageMatchedRules(
  staged: readonly StagedRule[],
  rules: readonly RuleEntry[],
  path: string,
  sessionId: string | null,
  now: number,
): readonly StagedRule[] {
  const matched: readonly RuleEntry[] = matchRules(rules, path);
  const restaged: readonly string[] = matched.map(
    (rule: RuleEntry): string => rule.hash,
  );
  const held: readonly StagedRule[] = staged.filter(
    (entry: StagedRule): boolean =>
      entry.deliveredAt === null &&
      entry.expiresAt > now &&
      (entry.sessionId !== sessionId || !restaged.includes(entry.hash)),
  );
  return [
    ...held,
    ...matched.map((rule: RuleEntry): StagedRule => ({
      text: rule.text,
      hash: rule.hash,
      sessionId,
      stagedAt: now,
      expiresAt: now + RULE_EXPIRY_WINDOW_MS,
      deliveredAt: null,
    })),
  ];
}
