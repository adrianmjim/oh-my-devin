import { MEMORY_CLASS_CAP } from './memory-class-cap';
import type { RuleEntry } from './rule-entry';

export function admitRuleEntry(
  entries: readonly RuleEntry[],
  candidate: RuleEntry,
): readonly RuleEntry[] {
  const seen: Set<string> = new Set<string>();
  const collapsed: RuleEntry[] = [];
  for (const entry of entries) {
    if (!seen.has(entry.hash)) {
      seen.add(entry.hash);
      collapsed.push(entry);
    }
  }
  const admitted: readonly RuleEntry[] = seen.has(candidate.hash)
    ? collapsed
    : [...collapsed, candidate];
  const overflow: number = admitted.length - MEMORY_CLASS_CAP.rules;
  return overflow > 0 ? admitted.slice(overflow) : [...admitted];
}
