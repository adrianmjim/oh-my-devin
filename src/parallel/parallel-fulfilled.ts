export interface ParallelFulfilled<T> {
  readonly instanceId: string;
  readonly status: 'fulfilled';
  readonly value: T;
}
