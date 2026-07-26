import type { ClarificationAnswer } from './clarification-answer';
import { DeliberationError } from './deliberation-error';

export function parseClarifications(
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
