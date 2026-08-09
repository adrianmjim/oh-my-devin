import type { GuardDecisionInput } from './guard-decision-input';
import type { GuardOutcome } from './guard-outcome';
import { renderAskOutput } from './render-ask-output';
import { renderDenyOutput } from './render-deny-output';

export function decideGuardOutcome(
  input: GuardDecisionInput,
): GuardOutcome | null {
  let outcome: GuardOutcome | null;
  if (input.level === 'off') {
    outcome = null;
  } else if (!input.outOfScope) {
    outcome = { decision: 'allowed', reason: '', output: {}, notice: null };
  } else if (input.level === 'warn') {
    outcome = {
      decision: 'warned',
      reason: input.reason,
      output: {},
      notice: {
        tool: input.tool,
        filePath: input.filePath,
        noticedAt: input.at,
      },
    };
  } else if (input.level === 'ask') {
    outcome = {
      decision: 'asked',
      reason: input.reason,
      output: renderAskOutput(input.reason),
      notice: null,
    };
  } else {
    outcome = {
      decision: 'blocked',
      reason: input.reason,
      output: renderDenyOutput(input.reason),
      notice: null,
    };
  }
  return outcome;
}
