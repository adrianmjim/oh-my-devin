import { join } from 'node:path';
import type { RunReport } from '../outcome/run-report';
import type { Worktree } from '../worktree/worktree';
import { WorktreePool } from '../worktree/worktree-pool';
import type { ClarificationAnswer } from './clarification-answer';
import { DeliberationError } from './deliberation-error';
import type { ProposerAction } from './proposer-action';
import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';
import type { SeatSessionDeps } from './seat-session-deps';
import type { TypedPosition } from './typed-position';

export function createProposerAction(
  deps: SeatSessionDeps,
  pool: WorktreePool,
): ProposerAction {
  return async (request: ProposerRequest): Promise<ProposerResult> => {
    const worktree: Worktree = await pool.acquire(`seat-${request.seat.id}`);
    const report: RunReport = await deps.runRole({
      roleName: request.seat.role,
      task: composeProposerPrompt(request),
      workingDirectory: worktree.path,
      model: request.seat.model,
      runner: deps.runnerFor(worktree.path),
      clock: deps.clock,
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

function composeProposerPrompt(request: ProposerRequest): string {
  const sections: string[] = [`## Question\n${request.question}`];
  if (request.currentProposal === null) {
    sections.push('Draft a proposal that answers the question.');
    return sections.join('\n\n');
  }
  sections.push(`## Current proposal\n${request.currentProposal}`);
  if (request.clarificationQuestions.length > 0) {
    sections.push(
      `## Clarification questions\n${renderQuestions(request.clarificationQuestions)}`,
    );
    sections.push(
      'Answer each clarification question about the current proposal in a "clarifications" array of {"question", "answer"} entries, and restate the proposal unchanged in "proposal".',
    );
    return sections.join('\n\n');
  }
  sections.push(`## Blocking objections\n${renderBlocking(request.blocking)}`);
  sections.push('Revise the proposal to resolve the blocking objections.');
  return sections.join('\n\n');
}

function renderQuestions(questions: readonly string[]): string {
  return questions
    .map((question: string): string => `- ${question}`)
    .join('\n');
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

function parseProposerResult(seatId: string, raw: string): ProposerResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DeliberationError(
      `proposer seat "${seatId}" produced invalid JSON`,
    );
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new DeliberationError(
      `proposer seat "${seatId}" proposal must be a JSON object`,
    );
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;
  const proposal: unknown = fields['proposal'];
  if (typeof proposal !== 'string' || proposal.length === 0) {
    throw new DeliberationError(
      `proposer seat "${seatId}" must produce a non-empty "proposal" string`,
    );
  }
  return {
    proposal,
    clarifications: parseClarifications(seatId, fields['clarifications']),
  };
}

function parseClarifications(
  seatId: string,
  value: unknown,
): readonly ClarificationAnswer[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new DeliberationError(
      `proposer seat "${seatId}" clarifications must be an array`,
    );
  }
  return value.map((entry: unknown): ClarificationAnswer => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new DeliberationError(
        `proposer seat "${seatId}" clarifications entries must be objects`,
      );
    }
    const fields: Record<string, unknown> = entry as Record<string, unknown>;
    const question: unknown = fields['question'];
    const answer: unknown = fields['answer'];
    if (typeof question !== 'string' || typeof answer !== 'string') {
      throw new DeliberationError(
        `proposer seat "${seatId}" clarifications entries must carry string "question" and "answer"`,
      );
    }
    return { question, answer };
  });
}
