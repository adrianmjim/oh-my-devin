import { describe, expect, it } from 'vitest';
import type { IntervalHandle } from './interval-scheduler';
import { systemIntervalScheduler } from './system-interval-scheduler';

describe('systemIntervalScheduler', () => {
  it('returns a cancel handle that stops the interval without throwing', () => {
    let ticks: number = 0;
    const cancel: IntervalHandle = systemIntervalScheduler((): void => {
      ticks += 1;
    }, 3600000);

    expect(typeof cancel).toBe('function');
    cancel();
    expect(ticks).toBe(0);
  });
});
