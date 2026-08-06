import type { ExecutorTestsClaim } from './executor-tests-claim';

export function isExecutorTestsClaim(
  value: unknown,
): value is ExecutorTestsClaim {
  return value === 'passed' || value === 'failed';
}
