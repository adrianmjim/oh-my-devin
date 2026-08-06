import type { ExecutorCommand } from './executor-command';
import type { ExecutorTestsClaim } from './executor-tests-claim';

export interface ExecutorArtifact {
  readonly tests: ExecutorTestsClaim;
  readonly commands: readonly ExecutorCommand[];
}
