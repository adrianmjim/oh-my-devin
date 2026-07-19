import type { ParallelFulfilled } from './parallel-fulfilled';
import type { ParallelRejected } from './parallel-rejected';

export type ParallelSettlement<T> = ParallelFulfilled<T> | ParallelRejected;
