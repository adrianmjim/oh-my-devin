import { describe, expect, it } from 'vitest';
import { renderDenyOutput } from './render-deny-output';

describe('renderDenyOutput', () => {
  it('emits the quiet JSON deny decision carrying the reason', () => {
    const output: Record<string, unknown> = renderDenyOutput('out of scope');

    expect(output).toEqual({
      decision: 'block',
      reason: 'out of scope',
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'out of scope',
      },
    });
  });

  it('stays serializable as the hook payload', () => {
    expect(JSON.parse(JSON.stringify(renderDenyOutput('why')))).toEqual(
      renderDenyOutput('why'),
    );
  });
});
