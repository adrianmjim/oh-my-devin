import type { InstanceTask } from './instance-task';

export interface ParallelInstance<T> {
  readonly instanceId: string;
  readonly workingDirectory: string;
  readonly run: InstanceTask<T>;
}
