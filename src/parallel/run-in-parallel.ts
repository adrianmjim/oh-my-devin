import { assertDistinctDirectories } from './assert-distinct-directories';
import type { ParallelInstance } from './parallel-instance';
import type { ParallelSettlement } from './parallel-settlement';
import { settleInstance } from './settle-instance';

export function runInParallel<T>(
  instances: readonly ParallelInstance<T>[],
): Promise<readonly ParallelSettlement<T>[]> {
  try {
    assertDistinctDirectories(instances);
  } catch (error: unknown) {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
  return Promise.all(
    instances.map(
      (instance: ParallelInstance<T>): Promise<ParallelSettlement<T>> =>
        settleInstance(instance),
    ),
  );
}
