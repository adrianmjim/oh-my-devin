import type { DecisionRecord } from './decision-record';
import type { DeliberationOutcome } from './deliberation-outcome';
import { exitCodeForClosure } from './exit-code-for-closure';
import type { JsonDeliberationOutcome } from './json-deliberation-outcome';

export function renderDeliberationOutcomeJson(
  outcome: DeliberationOutcome,
): JsonDeliberationOutcome {
  const record: DecisionRecord = outcome.record;
  return {
    question: record.question,
    closure: record.consent,
    proposal: record.proposal,
    proposalSource: record.proposalSource,
    authorityApplied: record.authorityApplied,
    resolution: outcome.authority.resolution,
    humanDecisionRequired: record.humanDecisionRequired,
    objections: record.objections.length,
    dissent: outcome.authority.dissent.length,
    utilityTurns: outcome.utilityTurns,
    bridgeLaunched: outcome.bridge.launched,
    exitCode: exitCodeForClosure(record.consent),
  };
}
