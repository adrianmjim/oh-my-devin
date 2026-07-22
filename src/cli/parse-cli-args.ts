import type { LayerComponent } from '../setup/layer-component';
import { isLayerComponent } from '../setup/layer-component';
import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';

const SCOPE_PREFIX: string = '--scope=';
const OUT_PREFIX: string = '--out=';
const PROPOSAL_PREFIX: string = '--proposal=';
const THEN_PREFIX: string = '--then=';

function isFlag(arg: string): boolean {
  return arg.startsWith('--');
}

function parseSetupScope(
  rest: readonly string[],
): readonly LayerComponent[] | null {
  const flag: string | undefined = rest.find((arg: string): boolean =>
    arg.startsWith(SCOPE_PREFIX),
  );
  if (flag === undefined) {
    return null;
  }
  const parts: readonly string[] = flag
    .slice(SCOPE_PREFIX.length)
    .split(',')
    .map((part: string): string => part.trim())
    .filter((part: string): boolean => part.length > 0);
  if (parts.length === 0) {
    throw new UsageError('usage: omd setup [--scope=rules,roles,skills,hooks]');
  }
  const components: LayerComponent[] = [];
  for (const part of parts) {
    if (!isLayerComponent(part)) {
      throw new UsageError(
        `unknown setup scope component "${part}" (expected: rules, roles, skills, hooks)`,
      );
    }
    components.push(part);
  }
  return components;
}

function parseCouncilRun(rest: readonly string[]): CliCommand {
  const usage: string =
    'usage: omd council run <council> "<question>" [--proposal <path>] [--then <team>] [--sign] [--json]';
  if (rest[0] !== 'run') {
    throw new UsageError(usage);
  }
  const council: string | undefined = rest[1];
  const question: string | undefined = rest[2];
  if (
    council === undefined ||
    question === undefined ||
    isFlag(council) ||
    isFlag(question)
  ) {
    throw new UsageError(usage);
  }
  let proposal: string | null = null;
  let team: string | null = null;
  let sign: boolean = false;
  let json: boolean = false;
  for (let index: number = 3; index < rest.length; index += 1) {
    const arg: string = rest[index] ?? '';
    if (arg === '--proposal' || arg === '--then') {
      const value: string | undefined = rest[index + 1];
      if (value === undefined || isFlag(value)) {
        throw new UsageError(usage);
      }
      if (arg === '--proposal') {
        proposal = value;
      } else {
        team = value;
      }
      index += 1;
    } else if (arg.startsWith(PROPOSAL_PREFIX)) {
      const value: string = arg.slice(PROPOSAL_PREFIX.length);
      if (value.length === 0) {
        throw new UsageError(usage);
      }
      proposal = value;
    } else if (arg.startsWith(THEN_PREFIX)) {
      const value: string = arg.slice(THEN_PREFIX.length);
      if (value.length === 0) {
        throw new UsageError(usage);
      }
      team = value;
    } else if (arg === '--sign') {
      sign = true;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new UsageError(usage);
    }
  }
  return { kind: 'council-run', council, question, proposal, team, sign, json };
}

function parseMode(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd mode <set|clear> [<mode>]';
  if (rest[0] === 'set') {
    const mode: string | undefined = rest[1];
    if (mode === undefined || isFlag(mode) || rest.length > 2) {
      throw new UsageError(usage);
    }
    return { kind: 'mode-set', mode };
  }
  if (rest[0] === 'clear' && rest.length === 1) {
    return { kind: 'mode-clear' };
  }
  throw new UsageError(usage);
}

function parsePluginBuild(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd plugin build [--out <dir>]';
  if (rest[0] !== 'build') {
    throw new UsageError(usage);
  }
  let out: string | null = null;
  for (let index: number = 1; index < rest.length; index += 1) {
    const arg: string = rest[index] ?? '';
    if (arg === '--out') {
      const value: string | undefined = rest[index + 1];
      if (value === undefined || isFlag(value)) {
        throw new UsageError(usage);
      }
      out = value;
      index += 1;
    } else if (arg.startsWith(OUT_PREFIX)) {
      const value: string = arg.slice(OUT_PREFIX.length);
      if (value.length === 0) {
        throw new UsageError(usage);
      }
      out = value;
    } else {
      throw new UsageError(usage);
    }
  }
  return { kind: 'plugin-build', out };
}

export function parseCliArgs(argv: readonly string[]): CliCommand {
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    return { kind: 'help' };
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
        throw new UsageError('usage: omd run <role> "<task>" [--json]');
      }
      return { kind: 'run', role, task, json };
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
    case 'setup':
      return { kind: 'setup', scope: parseSetupScope(rest) };
    case 'plugin':
      return parsePluginBuild(rest);
    case 'team': {
      if (positionals[0] !== 'run') {
        throw new UsageError('usage: omd team run <team> "<task>" [--json]');
      }
      const team: string | undefined = positionals[1];
      const task: string | undefined = positionals[2];
      if (team === undefined || task === undefined) {
        throw new UsageError('usage: omd team run <team> "<task>" [--json]');
      }
      return { kind: 'team-run', team, task, json };
    }
    case 'council':
      return parseCouncilRun(rest);
    case 'mode':
      return parseMode(rest);
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}
