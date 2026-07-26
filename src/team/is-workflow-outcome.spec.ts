import { describe, expect, it } from 'vitest';
import { isWorkflowOutcome } from './is-workflow-outcome';

describe('isWorkflowOutcome', () => {
  it('accepts the three workflow outcomes', () => {
    expect(isWorkflowOutcome('passed')).toBe(true);
    expect(isWorkflowOutcome('blocked')).toBe(true);
    expect(isWorkflowOutcome('bankrupt')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isWorkflowOutcome('failed')).toBe(false);
    expect(isWorkflowOutcome(undefined)).toBe(false);
  });
});
