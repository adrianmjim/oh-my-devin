import type { CommandResult } from '../engine/command-result';
import type { CheckResult } from './check-result';

export function devinPresenceCheck(version: CommandResult | null): CheckResult {
  if (version?.exitCode !== 0) {
    return {
      name: 'devin-cli',
      outcome: 'fail',
      message: 'devin executable not found on PATH',
    };
  }
  return {
    name: 'devin-cli',
    outcome: 'pass',
    message: 'devin executable found on PATH',
  };
}
