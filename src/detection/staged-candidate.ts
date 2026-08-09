export interface StagedCandidate {
  readonly principle: string;
  readonly confirmingCommand: string;
  readonly score: number;
  readonly sessionId: string | null;
  readonly expiresAt: number;
  readonly deliveredAt: number | null;
}
