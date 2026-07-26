import { DeliberationError } from './deliberation-error';
import { parseClarifications } from './parse-clarifications';
import type { ProposerResult } from './proposer-result';

export function parseProposerResult(
  seatId: string,
  raw: string,
): ProposerResult {
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
