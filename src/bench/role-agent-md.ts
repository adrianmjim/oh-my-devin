import { ARCHITECT_ROLE_AGENT_MD } from '../setup/architect-role-agent-md';
import { EXECUTOR_ROLE_AGENT_MD } from '../setup/executor-role-agent-md';
import { REVIEWER_ROLE_AGENT_MD } from '../setup/reviewer-role-agent-md';
import type { BenchRole } from './bench-role';

export function roleAgentMd(role: BenchRole): string {
  let body: string;
  if (role === 'reviewer') {
    body = REVIEWER_ROLE_AGENT_MD;
  } else if (role === 'architect') {
    body = ARCHITECT_ROLE_AGENT_MD;
  } else {
    body = EXECUTOR_ROLE_AGENT_MD;
  }
  return body;
}
