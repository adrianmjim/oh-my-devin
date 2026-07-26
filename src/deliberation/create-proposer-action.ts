import { join } from 'node:path';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import { WorktreePool } from '../worktree/worktree-pool';
import { composeProposerPrompt } from './compose-proposer-prompt';
import { DeliberationError } from './deliberation-error';
import { parseProposerResult } from './parse-proposer-result';
import type { ProposerAction } from './proposer-action';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
import type { SeatSessionDeps } from './seat-session-deps';

export function createProposerAction(
  deps: SeatSessionDeps,
  pool: WorktreePool,
): ProposerAction {
  return async (request: ProposerRequest): Promise<ProposerResult> => {
    const worktree: Worktree = await pool.acquire(`seat-${request.seat.id}`);
    const lookup: LayerLookup = {
      projectDir: worktree.path,
      userConfigDir: deps.userConfigDir,
    };
    const report: RunReport = await deps.runRole({
      roleName: request.seat.role,
      task: composeProposerPrompt(request),
      workingDirectory: worktree.path,
      model: request.seat.model,
      runner: deps.runnerFor(worktree.path),
      clock: deps.clock,
      lookup,
    });
    if (report.failureTier !== null || !report.artifactValid) {
      throw new DeliberationError(
        `proposer seat "${request.seat.id}" did not produce a proposal`,
      );
    }
    const raw: string = await deps.readArtifact(
      join(worktree.path, report.artifactPath),
    );
    return parseProposerResult(request.seat.id, raw);
  };
}
