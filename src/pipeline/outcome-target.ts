import type { OutcomeTransition } from '../team/outcome-transition';
import type { TeamTransition } from '../team/team-transition';

export function outcomeTarget(
  transition: TeamTransition,
  outcome: string,
): string | undefined {
  return transition.outcomes.find(
    (candidate: OutcomeTransition): boolean => candidate.outcome === outcome,
  )?.to;
}
