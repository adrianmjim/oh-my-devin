import type { WorkflowOutcome } from './workflow-outcome';

export function isWorkflowOutcome(value: unknown): value is WorkflowOutcome {
  return value === 'passed' || value === 'blocked' || value === 'bankrupt';
}
