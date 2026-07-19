import { join } from 'node:path';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import type { AnonymizedArgument } from './anonymized-argument';
import { DeliberationError } from './deliberation-error';
import { parseSeatPosition } from './parse-seat-position';
import type { SeatInvocation } from './seat-invocation';
import type { SeatInvoker } from './seat-invoker';
import type { SeatSessionDeps } from './seat-session-deps';
import type { TypedPosition } from './typed-position';

export function createSeatInvoker(deps: SeatSessionDeps): SeatInvoker {
  return async (invocation: SeatInvocation): Promise<TypedPosition> => {
    const worktree: Worktree = await deps.worktrees.create(
      `seat-${invocation.seat.role}`,
    );
    try {
      const report: RunReport = await deps.runRole({
        roleName: invocation.seat.role,
        task: composeSeatPrompt(invocation),
        workingDirectory: worktree.path,
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
    } finally {
      await deps.worktrees.remove(worktree);
    }
  };
}

function composeSeatPrompt(invocation: SeatInvocation): string {
  const sections: string[] = [
    `You hold the "${invocation.seat.lens}" lens on this council.`,
    invocation.seat.contrarian
      ? 'You are the contrarian seat: surface the strongest objection even if you would otherwise consent.'
      : 'Assess the proposal through your lens and state your position.',
    `## Proposal\n${invocation.proposal}`,
  ];
  if (invocation.priorArguments.length > 0) {
    sections.push(
      `## Prior arguments\n${renderPriorArguments(invocation.priorArguments)}`,
    );
  }
  return sections.join('\n\n');
}

function renderPriorArguments(args: readonly AnonymizedArgument[]): string {
  return args
    .map(
      (arg: AnonymizedArgument): string =>
        `- [${arg.kind}/${arg.severity}] ${arg.domain}: ${arg.concern}`,
    )
    .join('\n');
}
