export type IntervalHandle = () => void;

export type IntervalScheduler = (
  callback: () => void,
  intervalMs: number,
) => IntervalHandle;
