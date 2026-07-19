import type { DecisionRecord } from './decision-record';
import type { DeliberationOutcome } from './deliberation-outcome';

export function renderDeliberationOutcome(
  outcome: DeliberationOutcome,
): string {
  const record: DecisionRecord = outcome.record;
  return [
    `omd council run — ${record.consent}`,
    `question: ${record.question}`,
    `proposal (${record.proposalSource}): ${record.proposal}`,
    `authority: ${record.authorityApplied} → ${outcome.authority.resolution}`,
    `human decision required: ${record.humanDecisionRequired}`,
    `objections: ${record.objections.length}`,
    `dissent carried: ${outcome.authority.dissent.length}`,
    `team pipeline launched: ${outcome.bridge.launched}`,
  ].join('\n');
}
