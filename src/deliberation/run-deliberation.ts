import { applyAuthorityGate } from './apply-authority-gate';
import type { AuthorityOutcome } from './authority-outcome';
import { bridgeToTeamMode } from './bridge-to-team-mode';
import type { BridgeResult } from './bridge-result';
import type { ClosureState } from './closure-state';
import type { DecisionRecord } from './decision-record';
import type { DeliberationInput } from './deliberation-input';
import type { DeliberationOutcome } from './deliberation-outcome';
import { detectEchoes } from './detect-echoes';
import type { EchoCluster } from './echo-cluster';
import { emitDecisionRecord } from './emit-decision-record';
import { evaluateTermination } from './evaluate-termination';
import type { ProposalSource } from './proposal-source';
import { runRound } from './run-round';
import type { RoundResult } from './round-result';
import type { SeatArgument } from './seat-argument';
import type { TerminationDecision } from './termination-decision';
import type { TypedPosition } from './typed-position';

export async function runDeliberation(
  input: DeliberationInput,
): Promise<DeliberationOutcome> {
  const start: number = input.clock();
  const allPositions: TypedPosition[] = [];
  const proposalSource: ProposalSource =
    input.attachedProposal !== null ? 'attached' : 'proposer';

  let proposal: string | null = input.attachedProposal;
  let priorPositions: readonly TypedPosition[] = [];
  let priorBlocking: readonly TypedPosition[] = [];
  let round: number = 1;
  let decidedProposal: string;
  let closure: ClosureState;

  for (;;) {
    const result: RoundResult = await runRound({
      council: input.council,
      question: input.question,
      round,
      incomingProposal: proposal,
      priorPositions,
      seatInvoker: input.seatInvoker,
      proposerAction: input.proposerAction,
    });
    allPositions.push(...result.positions);
    decidedProposal = result.proposal;

    const termination: TerminationDecision = evaluateTermination({
      consented: result.consent.consented,
      blocking: result.consent.blocking,
      previousBlocking: priorBlocking,
      threshold: input.council.tunables.blockingThreshold,
      round,
      roundsCap: input.council.tunables.roundsCap,
      wallTimeExceeded: wallTimeExceeded(input, start),
    });

    if (termination.terminated && termination.closure !== null) {
      closure = termination.closure;
      break;
    }

    priorPositions = result.positions;
    priorBlocking = result.consent.blocking;
    proposal = result.proposal;
    round += 1;
  }

  const supporting: readonly EchoCluster[] = detectEchoes(
    supportingArguments(allPositions),
    input.claimKeyOf,
  );

  const record: DecisionRecord = emitDecisionRecord({
    question: input.question,
    proposal: decidedProposal,
    proposalSource,
    closure,
    authority: input.council.authority,
    supporting,
    objections: allPositions,
    assumptions: [],
    reconsiderWhen: [],
  });

  const authority: AuthorityOutcome = applyAuthorityGate(record);
  const bridge: BridgeResult = await bridgeToTeamMode({
    record,
    team: input.team,
    humanSigned: input.humanSigned,
    launch: input.launch,
  });

  return { record, authority, bridge };
}

function supportingArguments(
  positions: readonly TypedPosition[],
): readonly SeatArgument[] {
  return positions
    .filter(
      (position: TypedPosition): boolean => position.kind === 'preference',
    )
    .map((position: TypedPosition): SeatArgument => ({
      seat: position.seat,
      claim: position.concern,
    }));
}

function wallTimeExceeded(input: DeliberationInput, start: number): boolean {
  const cap: number | null = input.council.tunables.wallTimeMs;
  if (cap === null) {
    return false;
  }
  return input.clock() - start >= cap;
}
