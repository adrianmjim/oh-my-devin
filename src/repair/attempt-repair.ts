import type { ArtifactValidation } from '../artifact/artifact-validation';
import type { SessionTurnResult } from '../session/session-turn-result';
import type { TurnSender } from '../session/turn-sender';
import { buildRepairPrompt } from './build-repair-prompt';

export function attemptRepair(
  sender: TurnSender,
  validation: ArtifactValidation,
  schemaText: string,
): Promise<SessionTurnResult> {
  return sender.sendTurn(buildRepairPrompt(validation, schemaText));
}
