import { describe, expect, it } from 'vitest';
import type { AgentConfigBundle } from './agent-config-bundle';
import { deriveApprovalPosture } from './derive-approval-posture';

function bundleWith(allow: readonly string[]): AgentConfigBundle {
  return {
    system_instructions: ['preamble', 'body'],
    allowed_tools: ['read'],
    permissions: { allow, deny: [], ask: [] },
  };
}

describe('deriveApprovalPosture', () => {
  it('derives the artifact-write posture for grants of reads and the artifact write', () => {
    const posture = deriveApprovalPosture(
      bundleWith(['Read(**)', 'Write(review.json)']),
    );

    expect(posture).toBe('artifact-write');
  });

  it('derives the command-execution posture when the grants include command execution', () => {
    const posture = deriveApprovalPosture(
      bundleWith(['Write(evidence.json)', 'Exec(**)']),
    );

    expect(posture).toBe('command-execution');
  });

  it('derives the same posture for the same bundle every time', () => {
    const bundle: AgentConfigBundle = bundleWith([
      'Write(evidence.json)',
      'Exec(**)',
    ]);

    expect(deriveApprovalPosture(bundle)).toBe(deriveApprovalPosture(bundle));
  });
});
