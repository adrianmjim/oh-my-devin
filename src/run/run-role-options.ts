import type { Clock } from '../budget/clock';
import type { CommandRunner } from '../engine/command-runner';
import type { RunId } from '../observability/run-id';
import type { RunObserver } from '../observability/run-observer';
import type { DenyDetector } from './deny-detector';
import type { ResolvedRunInvocation } from './resolved-run-invocation';

export interface RunRoleOptions {
  readonly roleName: string;
  readonly task: string;
  readonly workingDirectory: string;
  readonly model: string | null;
  readonly runner: CommandRunner;
  readonly clock: Clock;
  readonly detectDeny?: DenyDetector;
  readonly runId?: RunId;
  readonly recorder?: RunObserver;
  readonly resolved?: ResolvedRunInvocation;
}
