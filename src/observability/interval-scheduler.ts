import type { IntervalHandle } from './interval-handle';

export type IntervalScheduler = (
  callback: () => void,
  intervalMs: number,
) => IntervalHandle;
