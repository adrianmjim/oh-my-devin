import { readFile } from 'node:fs/promises';
import { DetectionStatePaths } from './detection-state-paths';
import { isStagedRule } from './is-staged-rule';
import type { StagedRule } from './staged-rule';

export async function readStagedRules(
  baseDir: string,
): Promise<readonly StagedRule[]> {
  let raw: string;
  try {
    raw = await readFile(new DetectionStatePaths(baseDir).rules, 'utf8');
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isStagedRule) : [];
}
