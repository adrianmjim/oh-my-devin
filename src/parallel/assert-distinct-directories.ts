import { ParallelError } from './parallel-error';
import type { ParallelInstance } from './parallel-instance';

export function assertDistinctDirectories<T>(
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
