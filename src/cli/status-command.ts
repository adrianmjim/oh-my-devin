export interface StatusCommand {
  readonly kind: 'status';
  readonly runId: string;
  readonly json: boolean;
}
