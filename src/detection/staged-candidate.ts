export interface StagedCandidate {
  readonly principle: string;
  readonly confirmingCommand: string;
  readonly score: number;
  readonly expiresAt: number;
  readonly deliveredAt: number | null;
}
