import type { PipelineReport } from '../pipeline/pipeline-report';
import type { BridgeInput } from './bridge-input';
import type { BridgeResult } from './bridge-result';
import { isBridgeAuthorized } from './is-bridge-authorized';

export async function bridgeToTeamMode(
  input: BridgeInput,
): Promise<BridgeResult> {
  if (
    input.team === null ||
    !isBridgeAuthorized(input.record, input.humanSigned)
  ) {
    return { launched: false, pipeline: null };
  }
  const pipeline: PipelineReport = await input.launch({
    team: input.team,
    question: input.record.question,
    proposal: input.record.proposal,
  });
  return { launched: true, pipeline };
}
