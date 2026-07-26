import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import type { CheckResult } from './check-result';
import { tryRunDevin } from './try-run-devin';

export async function headlessSurfaceCheck(
  runner: CommandRunner,
): Promise<CheckResult> {
  const result: CommandResult | null = await tryRunDevin(runner, [
    'list',
    '--format',
    'json',
  ]);
  if (result?.exitCode !== 0) {
    return {
      name: 'headless-surface',
      outcome: 'fail',
      message: 'devin list --format json did not run',
    };
  }
  try {
    new DevinHeadlessEngine().parseSessionListing(result.stdout);
  } catch {
    return {
      name: 'headless-surface',
      outcome: 'fail',
      message: 'devin list --format json returned an unexpected shape',
    };
  }
  return {
    name: 'headless-surface',
    outcome: 'pass',
    message: 'devin list --format json returns the expected shape',
  };
}
