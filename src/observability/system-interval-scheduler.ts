import type { IntervalHandle } from './interval-handle';
import type { IntervalScheduler } from './interval-scheduler';

export const systemIntervalScheduler: IntervalScheduler = (
  callback: () => void,
  intervalMs: number,
): IntervalHandle => {
  const timer: NodeJS.Timeout = setInterval(callback, intervalMs);
  timer.unref();
  return (): void => {
    clearInterval(timer);
  };
};
