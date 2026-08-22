import { readFile } from 'node:fs/promises';
import { isRuleEntry } from './is-rule-entry';
import { MemoryStorePaths } from './memory-store-paths';
import type { RuleEntry } from './rule-entry';

export async function readRules(
  baseDir: string,
): Promise<readonly RuleEntry[]> {
  let raw: string;
  try {
    raw = await readFile(new MemoryStorePaths(baseDir).rules, 'utf8');
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isRuleEntry) : [];
}
