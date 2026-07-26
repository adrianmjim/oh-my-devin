import type { ParallelInstance } from './parallel-instance';
import type { ParallelSettlement } from './parallel-settlement';

export async function settleInstance<T>(
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
