import { APPROVE_OUTCOME } from './approve-outcome';
import type { GateDecision } from './gate-decision';
import { outcomeTarget } from './outcome-target';
import { REJECT_OUTCOME } from './reject-outcome';
import type { TeamTransition } from '../team/team-transition';

export function resolveSuccessor(
  transition: TeamTransition | null,
  decision: GateDecision,
): string | null {
  if (transition === null) {
    return null;
  }
  if (decision === 'approve') {
    return outcomeTarget(transition, APPROVE_OUTCOME) ?? transition.then;
  }
  if (decision === 'reject') {
    return outcomeTarget(transition, REJECT_OUTCOME) ?? null;
  }
  return null;
}
