import { readFile } from 'node:fs/promises';
import { DetectionStatePaths } from './detection-state-paths';
import { isStagedCandidate } from './is-staged-candidate';
import type { StagedCandidate } from './staged-candidate';

export async function readStagedCandidates(
  baseDir: string,
): Promise<readonly StagedCandidate[]> {
  let raw: string;
  try {
    raw = await readFile(new DetectionStatePaths(baseDir).candidates, 'utf8');
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isStagedCandidate) : [];
}
