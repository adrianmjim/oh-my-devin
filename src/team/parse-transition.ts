import { isWorkflowOutcome } from './is-workflow-outcome';
import type { OutcomeTransition } from './outcome-transition';
import { OUTCOME_KEY_PATTERN } from './outcome-key-pattern';
import { TeamDefinitionError } from './team-definition-error';
import type { TeamTransition } from './team-transition';

export function parseTransition(
  from: string,
  value: unknown,
  validNodes: ReadonlySet<string>,
): TeamTransition {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TeamDefinitionError(`workflow stage "${from}" must be a mapping`);
  }
  const spec: Record<string, unknown> = value as Record<string, unknown>;
  let then: string | null = null;
  const outcomes: OutcomeTransition[] = [];
  for (const key of Object.keys(spec)) {
    const target: unknown = spec[key];
    if (typeof target !== 'string') {
      throw new TeamDefinitionError(
        `workflow stage "${from}" transition "${key}" must name a successor`,
      );
    }
    if (!validNodes.has(target)) {
      throw new TeamDefinitionError(
        `workflow stage "${from}" transitions to unknown successor "${target}"`,
      );
    }
    if (key === 'then') {
      then = target;
    } else {
      const match: RegExpExecArray | null = OUTCOME_KEY_PATTERN.exec(key);
      if (match === null) {
        throw new TeamDefinitionError(
          `workflow stage "${from}" has an unrecognized transition key "${key}"`,
        );
      }
      const outcome: string = match[1] ?? '';
      if (!isWorkflowOutcome(outcome)) {
        throw new TeamDefinitionError(
          `workflow stage "${from}" declares an unknown outcome in key "${key}" (expected: on_passed, on_blocked, on_bankrupt)`,
        );
      }
      outcomes.push({ outcome, to: target });
    }
  }
  return { from, then, outcomes };
}
