import type { Clock } from '../budget/clock';
import type { IntervalHandle, IntervalScheduler } from './interval-scheduler';
import { writeLivenessStamp } from './write-liveness-stamp';

export class LivenessRefresher {
  private readonly stampPath: string;
  private readonly clock: Clock;
  private readonly intervalMs: number;
  private readonly scheduler: IntervalScheduler;
  private handle: IntervalHandle | null;

  public constructor(
    stampPath: string,
    clock: Clock,
    intervalMs: number,
    scheduler: IntervalScheduler,
  ) {
    this.stampPath = stampPath;
    this.clock = clock;
    this.intervalMs = intervalMs;
    this.scheduler = scheduler;
    this.handle = null;
  }

  public async refreshNow(): Promise<void> {
    await writeLivenessStamp(this.stampPath, this.clock());
  }

  public start(): void {
    this.handle ??= this.scheduler((): void => {
      this.refreshNow().catch((): void => undefined);
    }, this.intervalMs);
  }

  public stop(): void {
    if (this.handle !== null) {
      this.handle();
      this.handle = null;
    }
  }
}
