export type WorkflowOutcome = 'passed' | 'blocked' | 'bankrupt';

export function isWorkflowOutcome(value: unknown): value is WorkflowOutcome {
  return value === 'passed' || value === 'blocked' || value === 'bankrupt';
}
