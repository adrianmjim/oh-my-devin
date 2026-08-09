import { readFile } from 'node:fs/promises';
import { isRunClaim } from './is-run-claim';
import type { RunClaim } from './run-claim';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';
import { tryParseJson } from './try-parse-json';

export async function readRunClaim(
  baseDir: string,
  runId: RunId,
): Promise<RunClaim | null> {
  let raw: string | null;
  try {
    raw = await readFile(new RunRecordPaths(baseDir, runId).claim, 'utf8');
  } catch {
    raw = null;
  }
  const parsed: unknown = raw === null ? null : tryParseJson(raw);
  return isRunClaim(parsed) ? parsed : null;
}
