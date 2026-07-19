import type { Clock } from '../budget/clock';
import type { CommandRunner } from '../engine/command-runner';
import type { DenyDetector } from './deny-detector';

export interface RunRoleOptions {
  readonly roleName: string;
  readonly task: string;
  readonly workingDirectory: string;
  readonly runner: CommandRunner;
  readonly clock: Clock;
  readonly detectDeny?: DenyDetector;
}
