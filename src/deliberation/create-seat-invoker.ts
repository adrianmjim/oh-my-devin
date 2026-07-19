import { join } from 'node:path';
import type { RunReport } from '../outcome/run-report';
import type { ParallelInstance } from '../parallel/parallel-instance';
import type { ParallelSettlement } from '../parallel/parallel-settlement';
import { runInParallel } from '../parallel/run-in-parallel';
import type { Worktree } from '../worktree/worktree';
import { WorktreePool } from '../worktree/worktree-pool';
import type { AnonymizedArgument } from './anonymized-argument';
import { DeliberationError } from './deliberation-error';
import { parseSeatPosition } from './parse-seat-position';
import type { RelayedClarification } from './relayed-clarification';
import type { SeatInvocation } from './seat-invocation';
import type { SeatInvoker } from './seat-invoker';
import type { SeatPosition } from './seat-position';
import type { SeatSessionDeps } from './seat-session-deps';

export function createSeatInvoker(
  deps: SeatSessionDeps,
  pool: WorktreePool,
): SeatInvoker {
  return async (
    invocations: readonly SeatInvocation[],
  ): Promise<readonly SeatPosition[]> => {
    const instances: ParallelInstance<SeatPosition>[] = [];
    for (const invocation of invocations) {
      const worktree: Worktree = await pool.acquire(
        `seat-${invocation.seat.role}`,
      );
      instances.push({
        instanceId: worktree.instanceId,
        workingDirectory: worktree.path,
        run: (): Promise<SeatPosition> =>
          invokeSeat(deps, invocation, worktree),
      });
    }
    const settlements: readonly ParallelSettlement<SeatPosition>[] =
      await runInParallel(instances);
    return settlements.map(
      (settlement: ParallelSettlement<SeatPosition>): SeatPosition => {
        if (settlement.status === 'rejected') {
          throw settlement.reason;
        }
        return settlement.value;
      },
    );
  };
}

async function invokeSeat(
  deps: SeatSessionDeps,
  invocation: SeatInvocation,
  worktree: Worktree,
): Promise<SeatPosition> {
  const report: RunReport = await deps.runRole({
    roleName: invocation.seat.role,
    task: composeSeatPrompt(invocation),
    workingDirectory: worktree.path,
    model: invocation.seat.model,
    runner: deps.runnerFor(worktree.path),
    clock: deps.clock,
  });
  if (report.failureTier !== null || !report.artifactValid) {
    throw new DeliberationError(
      `seat "${invocation.seat.role}" did not produce a valid position`,
    );
  }
  const raw: string = await deps.readArtifact(
    join(worktree.path, report.artifactPath),
  );
  return parseSeatPosition(invocation.seat, raw);
}

function composeSeatPrompt(invocation: SeatInvocation): string {
  const sections: string[] = [
    `You hold the "${invocation.seat.lens}" lens on this council.`,
  ];
  if (invocation.seat.contrarian) {
    sections.push(
      'You are the contrarian seat: challenge the emerging consensus and surface the strongest objection even if you would otherwise consent.',
    );
  }
  sections.push(
    invocation.phase === 'clarification'
      ? 'Before taking a position, pose the clarification questions you need answered about the proposal. Write your artifact as {"kind": "clarification", "questions": [...]}; use an empty array when nothing needs clarification.'
      : 'Assess the proposal through your lens and state your position.',
  );
  sections.push(`## Question\n${invocation.question}`);
  sections.push(`## Proposal\n${invocation.proposal}`);
  if (invocation.clarifications.length > 0) {
    sections.push(
      `## Clarifications\n${renderClarifications(invocation.clarifications)}`,
    );
  }
  if (invocation.evidenceSummary !== null) {
    sections.push(`## Evidence summary\n${invocation.evidenceSummary}`);
  }
  if (invocation.priorArguments.length > 0) {
    sections.push(
      `## Prior arguments\n${renderPriorArguments(invocation.priorArguments)}`,
    );
  }
  return sections.join('\n\n');
}

function renderClarifications(
  clarifications: readonly RelayedClarification[],
): string {
  return clarifications
    .map(
      (clarification: RelayedClarification): string =>
        `- Q: ${clarification.question}\n  A: ${clarification.answer ?? '(unanswered)'}`,
    )
    .join('\n');
}

function renderPriorArguments(args: readonly AnonymizedArgument[]): string {
  return args
    .map(
      (arg: AnonymizedArgument): string =>
        `- [${arg.kind}/${arg.severity}] ${arg.domain}: ${arg.concern}`,
    )
    .join('\n');
}
