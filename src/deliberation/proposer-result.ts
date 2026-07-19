import type { ClarificationAnswer } from './clarification-answer';

export interface ProposerResult {
  readonly proposal: string;
  readonly clarifications: readonly ClarificationAnswer[];
}
