import type { SessionTurnResult } from './session-turn-result';

export interface TurnSender {
  sendTurn(prompt: string): Promise<SessionTurnResult>;
}
