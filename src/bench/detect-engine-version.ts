import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { parseDevinVersion } from '../doctor/parse-devin-version';
import { tryRunDevin } from '../doctor/try-run-devin';

export async function detectEngineVersion(
  runner: CommandRunner,
): Promise<string> {
  const result: CommandResult | null = await tryRunDevin(runner, ['--version']);
  const detected: string | null =
    result === null ? null : parseDevinVersion(result.stdout);
  return detected ?? 'unknown';
}
