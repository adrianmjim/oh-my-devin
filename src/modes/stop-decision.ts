export interface StopDecision {
  readonly decision: 'block' | 'approve';
  readonly reason: string | null;
}
