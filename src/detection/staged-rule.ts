export interface StagedRule {
  readonly text: string;
  readonly hash: string;
  readonly stagedAt: number;
  readonly deliveredAt: number | null;
}
