import type { SessionTurnResult } from '../session/session-turn-result';

export type DenyDetector = (result: SessionTurnResult) => string | null;
