import { ParallelError } from './parallel-error';
import type { ParallelInstance } from './parallel-instance';
import type { ParallelSettlement } from './parallel-settlement';

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
        settle(instance),
    ),
  );
}

function assertDistinctDirectories<T>(
  instances: readonly ParallelInstance<T>[],
): void {
  const seen: Set<string> = new Set<string>();
  for (const instance of instances) {
    if (seen.has(instance.workingDirectory)) {
      throw new ParallelError(
        `concurrent instances must not share a working directory: "${instance.workingDirectory}"`,
      );
    }
    seen.add(instance.workingDirectory);
  }
}

async function settle<T>(
  instance: ParallelInstance<T>,
): Promise<ParallelSettlement<T>> {
  try {
    const value: T = await instance.run();
    return { instanceId: instance.instanceId, status: 'fulfilled', value };
  } catch (error: unknown) {
    return {
      instanceId: instance.instanceId,
      status: 'rejected',
      reason: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
