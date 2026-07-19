import { USAGE_ERROR_EXIT_CODE } from '../outcome/usage-error-exit-code';
import { UsageError } from '../run/usage-error';
import type { CliErrorRendering } from './cli-error-rendering';

export function renderCliError(
  error: unknown,
  json: boolean,
): CliErrorRendering {
  if (error instanceof UsageError) {
    return {
      stderrText: json
        ? JSON.stringify({
            error: error.message,
            exitCode: USAGE_ERROR_EXIT_CODE,
          })
        : `usage error: ${error.message}`,
      exitCode: USAGE_ERROR_EXIT_CODE,
    };
  }
  return {
    stderrText: `error: ${error instanceof Error ? error.message : String(error)}`,
    exitCode: 1,
  };
}
