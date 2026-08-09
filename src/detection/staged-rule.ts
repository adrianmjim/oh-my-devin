export interface StagedRule {
  readonly text: string;
  readonly hash: string;
  readonly sessionId: string | null;
  readonly stagedAt: number;
  readonly deliveredAt: number | null;
}
