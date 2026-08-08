import { join } from 'node:path';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import { composeSeatPrompt } from './compose-seat-prompt';
import { DeliberationError } from './deliberation-error';
import { parseSeatPosition } from './parse-seat-position';
import type { SeatInvocation } from './seat-invocation';
import type { SeatPosition } from './seat-position';
import type { SeatSessionDeps } from './seat-session-deps';

export async function invokeSeat(
  deps: SeatSessionDeps,
  invocation: SeatInvocation,
  worktree: Worktree,
): Promise<SeatPosition> {
  const lookup: LayerLookup = {
    projectDir: worktree.path,
    userConfigDir: deps.userConfigDir,
  };
  const report: RunReport = await deps.runRole({
    roleName: invocation.seat.role,
    task: composeSeatPrompt(invocation),
    workingDirectory: worktree.path,
    model: invocation.seat.model,
    runner: deps.runnerFor(worktree.path),
    clock: deps.clock,
    lookup,
    memoryBaseDir: deps.memoryBaseDir,
  });
  if (report.failureTier !== null || !report.artifactValid) {
    throw new DeliberationError(
      `seat "${invocation.seat.id}" did not produce a valid position`,
    );
  }
  const raw: string = await deps.readArtifact(
    join(worktree.path, report.artifactPath),
  );
  return parseSeatPosition(invocation.seat, raw);
}
