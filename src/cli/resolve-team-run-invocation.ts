import { DEFAULT_TEAM_NAME } from '../team/default-team-name';
import { UsageError } from '../run/usage-error';
import type { TeamRunInvocation } from './team-run-invocation';

const USAGE: string = 'usage: omd team run [<team>] "<task>" [--json]';

export function resolveTeamRunInvocation(
  positionals: readonly string[],
): TeamRunInvocation {
  let invocation: TeamRunInvocation;
  if (positionals.length === 2) {
    invocation = { team: positionals[0] ?? '', task: positionals[1] ?? '' };
  } else if (positionals.length === 1) {
    invocation = { team: DEFAULT_TEAM_NAME, task: positionals[0] ?? '' };
  } else {
    throw new UsageError(USAGE);
  }
  return invocation;
}
