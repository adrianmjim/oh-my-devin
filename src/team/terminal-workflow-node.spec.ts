import { describe, expect, it } from 'vitest';
import { TERMINAL_WORKFLOW_NODE } from './terminal-workflow-node';

describe('TERMINAL_WORKFLOW_NODE', () => {
  it('names the node a workflow ends at', () => {
    expect(TERMINAL_WORKFLOW_NODE).toBe('done');
  });
});
