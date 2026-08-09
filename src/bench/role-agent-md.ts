import { ANALYST_ROLE_AGENT_MD } from '../setup/analyst-role-agent-md';
import { ARCHITECT_ROLE_AGENT_MD } from '../setup/architect-role-agent-md';
import { CRITIC_ROLE_AGENT_MD } from '../setup/critic-role-agent-md';
import { DEBUGGER_ROLE_AGENT_MD } from '../setup/debugger-role-agent-md';
import { DOCUMENT_SPECIALIST_ROLE_AGENT_MD } from '../setup/document-specialist-role-agent-md';
import { EXECUTOR_ROLE_AGENT_MD } from '../setup/executor-role-agent-md';
import { EXPLORE_ROLE_AGENT_MD } from '../setup/explore-role-agent-md';
import { REVIEWER_ROLE_AGENT_MD } from '../setup/reviewer-role-agent-md';
import { SECURITY_REVIEWER_ROLE_AGENT_MD } from '../setup/security-reviewer-role-agent-md';
import type { BenchRole } from './bench-role';

export function roleAgentMd(role: BenchRole): string {
  const bodies: Record<BenchRole, string> = {
    reviewer: REVIEWER_ROLE_AGENT_MD,
    architect: ARCHITECT_ROLE_AGENT_MD,
    executor: EXECUTOR_ROLE_AGENT_MD,
    critic: CRITIC_ROLE_AGENT_MD,
    analyst: ANALYST_ROLE_AGENT_MD,
    'security-reviewer': SECURITY_REVIEWER_ROLE_AGENT_MD,
    debugger: DEBUGGER_ROLE_AGENT_MD,
    explore: EXPLORE_ROLE_AGENT_MD,
    'document-specialist': DOCUMENT_SPECIALIST_ROLE_AGENT_MD,
  };
  return bodies[role];
}
