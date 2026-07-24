import type { RunId } from '../observability/run-id';
import type { JsonDetachedLaunch } from './json-detached-launch';

export function renderDetachedLaunchJson(runId: RunId): JsonDetachedLaunch {
  return { runId };
}
