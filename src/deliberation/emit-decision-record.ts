import type { DecisionRecord } from './decision-record';
import type { EchoCluster } from './echo-cluster';
import type { RecordInput } from './record-input';
import type { RecordedObjection } from './recorded-objection';
import type { SupportingArgument } from './supporting-argument';
import type { TypedPosition } from './typed-position';

export function emitDecisionRecord(input: RecordInput): DecisionRecord {
  const supportingArguments: readonly SupportingArgument[] =
    input.supporting.map((cluster: EchoCluster): SupportingArgument => ({
      id: cluster.id,
      claim: cluster.claim,
      endorsements: cluster.endorsements,
    }));

  const objections: readonly RecordedObjection[] = dedupeObjections(
    input.objections
      .filter(
        (position: TypedPosition): boolean => position.kind === 'objection',
      )
      .map((position: TypedPosition): RecordedObjection => ({
        seat: position.seat,
        domain: position.domain,
        severity: position.severity,
        concern: position.concern,
      })),
  );

  return {
    question: input.question,
    proposal: input.proposal,
    proposalSource: input.proposalSource,
    consent: input.closure,
    authorityApplied: input.authority,
    supportingArguments,
    objections,
    assumptions: input.assumptions,
    reconsiderWhen: input.reconsiderWhen,
    humanDecisionRequired:
      input.closure !== 'passed' || input.authority === 'human',
  };
}

function dedupeObjections(
  objections: readonly RecordedObjection[],
): readonly RecordedObjection[] {
  const seen: Set<string> = new Set<string>();
  const unique: RecordedObjection[] = [];
  for (const objection of objections) {
    const key: string = JSON.stringify([
      objection.seat,
      objection.domain,
      objection.severity,
      objection.concern,
    ]);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(objection);
    }
  }
  return unique;
}
