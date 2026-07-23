import { randomUUID } from 'node:crypto';
import type { RunId } from './run-id';

export function generateRunId(): RunId {
  return randomUUID();
}
