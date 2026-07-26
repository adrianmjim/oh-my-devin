import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';
import { PROPOSAL_PREFIX } from './proposal-prefix';
import { THEN_PREFIX } from './then-prefix';

export function parseCouncilRun(rest: readonly string[]): CliCommand {
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
