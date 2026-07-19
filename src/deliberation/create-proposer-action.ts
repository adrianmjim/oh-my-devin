import { join } from 'node:path';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import { DeliberationError } from './deliberation-error';
import type { ProposerAction } from './proposer-action';
import type { ProposerRequest } from './proposer-request';
import type { SeatSessionDeps } from './seat-session-deps';
import type { TypedPosition } from './typed-position';

export function createProposerAction(deps: SeatSessionDeps): ProposerAction {
  return async (request: ProposerRequest): Promise<string> => {
    const worktree: Worktree = await deps.worktrees.create(
      `proposer-${request.seat.role}`,
    );
    try {
      const report: RunReport = await deps.runRole({
        roleName: request.seat.role,
        task: composeProposerPrompt(request),
        workingDirectory: worktree.path,
        runner: deps.runnerFor(worktree.path),
        clock: deps.clock,
      });
      if (report.failureTier !== null || !report.artifactValid) {
        throw new DeliberationError(
          `proposer seat "${request.seat.role}" did not produce a proposal`,
        );
      }
      const raw: string = await deps.readArtifact(
        join(worktree.path, report.artifactPath),
      );
      return parseProposal(request.seat.role, raw);
    } finally {
      await deps.worktrees.remove(worktree);
    }
  };
}

function composeProposerPrompt(request: ProposerRequest): string {
  const sections: string[] = [`## Question\n${request.question}`];
  if (request.currentProposal === null) {
    sections.push('Draft a proposal that answers the question.');
    return sections.join('\n\n');
  }
  sections.push(`## Current proposal\n${request.currentProposal}`);
  sections.push(`## Blocking objections\n${renderBlocking(request.blocking)}`);
  sections.push('Revise the proposal to resolve the blocking objections.');
  return sections.join('\n\n');
}

function renderBlocking(blocking: readonly TypedPosition[]): string {
  if (blocking.length === 0) {
    return '(none)';
  }
  return blocking
    .map(
      (position: TypedPosition): string =>
        `- [${position.severity}] ${position.domain}: ${position.concern}`,
    )
    .join('\n');
}

function parseProposal(seatRole: string, raw: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DeliberationError(
      `proposer seat "${seatRole}" produced invalid JSON`,
    );
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new DeliberationError(
      `proposer seat "${seatRole}" proposal must be a JSON object`,
    );
  }
  const proposal: unknown = (parsed as Record<string, unknown>)['proposal'];
  if (typeof proposal !== 'string' || proposal.length === 0) {
    throw new DeliberationError(
      `proposer seat "${seatRole}" must produce a non-empty "proposal" string`,
    );
  }
  return proposal;
}
