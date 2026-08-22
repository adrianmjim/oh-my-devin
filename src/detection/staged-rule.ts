export interface StagedRule {
  readonly text: string;
  readonly hash: string;
  readonly sessionId: string | null;
  readonly stagedAt: number;
  readonly expiresAt: number;
  readonly deliveredAt: number | null;
}
