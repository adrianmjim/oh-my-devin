export interface ParallelRejected {
  readonly instanceId: string;
  readonly status: 'rejected';
  readonly reason: Error;
}
