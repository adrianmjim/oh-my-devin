import { describe, expect, it } from 'vitest';
import { renderAskOutput } from './render-ask-output';

describe('renderAskOutput', () => {
  it('emits the downgrade decision carrying the framing', () => {
    const output: Record<string, unknown> = renderAskOutput('confirm this');

    expect(output).toEqual({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: 'confirm this',
      },
    });
  });

  it('carries no blocking decision of its own', () => {
    expect(renderAskOutput('confirm this')['decision']).toBeUndefined();
  });
});
