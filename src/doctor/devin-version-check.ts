import type { CommandResult } from '../engine/command-result';
import type { CheckResult } from './check-result';
import { parseDevinVersion } from './parse-devin-version';
import { PINNED_DEVIN_VERSION } from './pinned-devin-version';

export function devinVersionCheck(version: CommandResult | null): CheckResult {
  const detected: string | null =
    version === null ? null : parseDevinVersion(version.stdout);
  if (detected === null) {
    return {
      name: 'devin-version',
      outcome: 'fail',
      message: 'could not determine the installed devin version',
    };
  }
  if (detected === PINNED_DEVIN_VERSION) {
    return {
      name: 'devin-version',
      outcome: 'pass',
      message: `devin ${detected} matches the pinned version`,
    };
  }
  return {
    name: 'devin-version',
    outcome: 'warn',
    message: `devin ${detected} drifts from pinned ${PINNED_DEVIN_VERSION}`,
  };
}
