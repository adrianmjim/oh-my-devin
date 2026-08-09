import type { Clock } from '../budget/clock';
import type { CommandRunner } from '../engine/command-runner';
import type { LayerLookup } from '../layer/layer-lookup';
import type { MemoryComposer } from '../memory/memory-composer';
import type { RunId } from '../observability/run-id';
import type { RunClaimWriter } from '../observability/run-claim-writer';
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
  readonly claimRun?: RunClaimWriter;
  readonly resolved?: ResolvedRunInvocation;
  readonly lookup?: LayerLookup;
  readonly provisionedWorktree?: boolean;
  readonly composeMemory?: MemoryComposer;
}
