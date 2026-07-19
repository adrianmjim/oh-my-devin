import { describe, expect, it } from 'vitest';
import { roleDefinitionPath } from './role-definition-path';

describe('roleDefinitionPath', () => {
  it('resolves a role to its native subagent AGENT.md location', () => {
    expect(roleDefinitionPath('/repo', 'reviewer')).toBe(
      '/repo/.devin/agents/reviewer/AGENT.md',
    );
  });
});
