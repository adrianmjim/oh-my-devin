import { generateRunId } from './generate-run-id';
import { isValidRunId } from './is-valid-run-id';
import type { RunId } from './run-id';

export function resolveRunId(requested: string | undefined): RunId {
  return requested !== undefined && isValidRunId(requested)
    ? requested
    : generateRunId();
}
