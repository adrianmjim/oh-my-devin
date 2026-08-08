import { UsageError } from '../run/usage-error';
import { assertKnownSetupArgs } from './assert-known-setup-args';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';
import { parseCouncilRun } from './parse-council-run';
import { parseMemory } from './parse-memory';
import { parseMode } from './parse-mode';
import { parsePluginBuild } from './parse-plugin-build';
import { parseSetupLevel } from './parse-setup-level';
import { parseSetupScope } from './parse-setup-scope';
import { resolveTeamRunInvocation } from './resolve-team-run-invocation';
import type { TeamRunInvocation } from './team-run-invocation';

export function parseCliArgs(argv: readonly string[]): CliCommand {
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    return { kind: 'help' };
  }

  if (argv[0] === '--version') {
    if (argv.length > 1) {
      throw new UsageError('usage: omd --version');
    }
    return { kind: 'version' };
  }

  const command: string = argv[0] ?? '';
  const rest: readonly string[] = argv.slice(1);
  const positionals: readonly string[] = rest.filter(
    (arg: string): boolean => !isFlag(arg),
  );
  const json: boolean = rest.includes('--json');

  switch (command) {
    case 'run': {
      const role: string | undefined = positionals[0];
      const task: string | undefined = positionals[1];
      if (role === undefined || task === undefined) {
        throw new UsageError(
          'usage: omd run <role> "<task>" [--detach] [--json]',
        );
      }
      const detach: boolean = rest.includes('--detach');
      return { kind: 'run', role, task, json, detach };
    }
    case 'status': {
      const runId: string | undefined = positionals[0];
      if (runId === undefined) {
        return { kind: 'status-list', json };
      }
      return { kind: 'status', runId, json };
    }
    case 'doctor':
      return { kind: 'doctor' };
    case 'roles': {
      const subcommand: string | undefined = positionals[0];
      if (subcommand === 'list') {
        return { kind: 'roles-list', json };
      }
      if (subcommand === 'show') {
        const role: string | undefined = positionals[1];
        if (role === undefined) {
          throw new UsageError('usage: omd roles show <role> [--json]');
        }
        return { kind: 'roles-show', role, json };
      }
      throw new UsageError('usage: omd roles <list|show> [<role>] [--json]');
    }
    case 'setup': {
      assertKnownSetupArgs(rest);
      return {
        kind: 'setup',
        scope: parseSetupScope(rest),
        level: parseSetupLevel(rest),
      };
    }
    case 'plugin':
      return parsePluginBuild(rest);
    case 'team': {
      if (positionals[0] !== 'run') {
        throw new UsageError('usage: omd team run [<team>] "<task>" [--json]');
      }
      if (rest.includes('--detach')) {
        throw new UsageError(
          'omd team run has no detached form; pipelines run in the blocking form',
        );
      }
      const invocation: TeamRunInvocation = resolveTeamRunInvocation(
        positionals.slice(1),
      );
      return {
        kind: 'team-run',
        team: invocation.team,
        task: invocation.task,
        json,
      };
    }
    case 'council':
      return parseCouncilRun(rest);
    case 'mode':
      return parseMode(rest);
    case 'memory':
      return parseMemory(rest);
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}
