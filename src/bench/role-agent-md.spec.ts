import { describe, expect, it } from 'vitest';
import { ARCHITECT_ROLE_AGENT_MD } from '../setup/architect-role-agent-md';
import { EXECUTOR_ROLE_AGENT_MD } from '../setup/executor-role-agent-md';
import { REVIEWER_ROLE_AGENT_MD } from '../setup/reviewer-role-agent-md';
import { roleAgentMd } from './role-agent-md';

describe('roleAgentMd', () => {
  it('returns the shipped prompt body the bench digests', () => {
    expect(roleAgentMd('reviewer')).toBe(REVIEWER_ROLE_AGENT_MD);
    expect(roleAgentMd('architect')).toBe(ARCHITECT_ROLE_AGENT_MD);
    expect(roleAgentMd('executor')).toBe(EXECUTOR_ROLE_AGENT_MD);
  });
});
