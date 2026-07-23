import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Clock } from '../budget/clock';
import type { IntervalHandle, IntervalScheduler } from './interval-scheduler';
import { LivenessRefresher } from './liveness-refresher';
import { readLivenessStamp } from './read-liveness-stamp';
import { RunRecordPaths } from './run-record-paths';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

interface CapturedInterval {
  callback: (() => void) | null;
  intervalMs: number | null;
  scheduleCount: number;
  cancelCount: number;
}

function fakeScheduler(captured: CapturedInterval): IntervalScheduler {
  return (callback: () => void, intervalMs: number): IntervalHandle => {
    captured.callback = callback;
    captured.intervalMs = intervalMs;
    captured.scheduleCount += 1;
    return (): void => {
      captured.cancelCount += 1;
    };
  };
}

describe('LivenessRefresher', () => {
  let base: string = '';
  let paths: RunRecordPaths;
  let now: number = 0;
  const clock: Clock = (): number => now;

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-refresher-'));
    paths = new RunRecordPaths(base, 'run-1');
    now = 1000;
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('writes the liveness stamp at the current clock on a refresh', async () => {
    const captured: CapturedInterval = {
      callback: null,
      intervalMs: null,
      scheduleCount: 0,
      cancelCount: 0,
    };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      fakeScheduler(captured),
    );

    await refresher.refreshNow();

    expect((await readLivenessStamp(paths.liveness))?.stampedAt).toBe(1000);
  });

  it('updates the stamp on a later refresh', async () => {
    const captured: CapturedInterval = {
      callback: null,
      intervalMs: null,
      scheduleCount: 0,
      cancelCount: 0,
    };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      fakeScheduler(captured),
    );

    await refresher.refreshNow();
    now = 9000;
    await refresher.refreshNow();

    expect((await readLivenessStamp(paths.liveness))?.stampedAt).toBe(9000);
  });

  it('refreshes without appending any journal event', async () => {
    const captured: CapturedInterval = {
      callback: null,
      intervalMs: null,
      scheduleCount: 0,
      cancelCount: 0,
    };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      fakeScheduler(captured),
    );

    await refresher.refreshNow();
    await refresher.refreshNow();

    expect(await exists(paths.journal)).toBe(false);
  });

  it('schedules a single interval at the configured cadence on start', () => {
    const captured: CapturedInterval = {
      callback: null,
      intervalMs: null,
      scheduleCount: 0,
      cancelCount: 0,
    };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      fakeScheduler(captured),
    );

    refresher.start();
    refresher.start();

    expect(captured.scheduleCount).toBe(1);
    expect(captured.intervalMs).toBe(15000);
  });

  it('cancels the interval on stop', () => {
    const captured: CapturedInterval = {
      callback: null,
      intervalMs: null,
      scheduleCount: 0,
      cancelCount: 0,
    };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      fakeScheduler(captured),
    );

    refresher.start();
    refresher.stop();

    expect(captured.cancelCount).toBe(1);
  });

  it('drives a stamp write when the scheduled tick fires', async () => {
    const captured: CapturedInterval = {
      callback: null,
      intervalMs: null,
      scheduleCount: 0,
      cancelCount: 0,
    };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      fakeScheduler(captured),
    );

    refresher.start();
    captured.callback?.();
    await refresher.refreshNow();

    expect((await readLivenessStamp(paths.liveness))?.stampedAt).toBe(1000);
  });
});
