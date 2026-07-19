import { describe, expect, it } from 'vitest';
import type { ParallelInstance } from './parallel-instance';
import type { ParallelSettlement } from './parallel-settlement';
import { ParallelError } from './parallel-error';
import { runInParallel } from './run-in-parallel';

class Barrier {
  private arrived: number = 0;
  private readonly size: number;
  private readonly waiting: (() => void)[] = [];

  public constructor(size: number) {
    this.size = size;
  }

  public arrive(): Promise<void> {
    this.arrived += 1;
    if (this.arrived >= this.size) {
      for (const release of this.waiting) {
        release();
      }
      this.waiting.length = 0;
      return Promise.resolve();
    }
    return new Promise<void>((resolve: () => void): void => {
      this.waiting.push(resolve);
    });
  }
}

function settlementFor<T>(
  settlements: readonly ParallelSettlement<T>[],
  instanceId: string,
): ParallelSettlement<T> {
  const found: ParallelSettlement<T> | undefined = settlements.find(
    (settlement: ParallelSettlement<T>): boolean =>
      settlement.instanceId === instanceId,
  );
  if (found === undefined) {
    throw new Error(`no settlement for instance "${instanceId}"`);
  }
  return found;
}

describe('runInParallel', () => {
  it('runs instances concurrently so their lifetimes overlap', async () => {
    const barrier: Barrier = new Barrier(2);
    const instances: readonly ParallelInstance<string>[] = [
      {
        instanceId: 'a',
        workingDirectory: '/wt/a',
        run: async (): Promise<string> => {
          await barrier.arrive();
          return 'a-done';
        },
      },
      {
        instanceId: 'b',
        workingDirectory: '/wt/b',
        run: async (): Promise<string> => {
          await barrier.arrive();
          return 'b-done';
        },
      },
    ];

    const settlements: readonly ParallelSettlement<string>[] =
      await runInParallel(instances);

    expect(settlementFor(settlements, 'a')).toEqual({
      instanceId: 'a',
      status: 'fulfilled',
      value: 'a-done',
    });
    expect(settlementFor(settlements, 'b')).toEqual({
      instanceId: 'b',
      status: 'fulfilled',
      value: 'b-done',
    });
  });

  it('rejects instances that share a working directory before running any', async () => {
    let launched: number = 0;
    const instances: readonly ParallelInstance<string>[] = [
      {
        instanceId: 'a',
        workingDirectory: '/wt/shared',
        run: (): Promise<string> => {
          launched += 1;
          return Promise.resolve('a');
        },
      },
      {
        instanceId: 'b',
        workingDirectory: '/wt/shared',
        run: (): Promise<string> => {
          launched += 1;
          return Promise.resolve('b');
        },
      },
    ];

    await expect(runInParallel(instances)).rejects.toThrow(ParallelError);
    expect(launched).toBe(0);
  });

  it('attributes each outcome to its own instance and isolates failures', async () => {
    const instances: readonly ParallelInstance<string>[] = [
      {
        instanceId: 'faulty',
        workingDirectory: '/wt/faulty',
        run: (): Promise<string> => Promise.reject(new Error('boom')),
      },
      {
        instanceId: 'healthy',
        workingDirectory: '/wt/healthy',
        run: (): Promise<string> => Promise.resolve('healthy-output'),
      },
    ];

    const settlements: readonly ParallelSettlement<string>[] =
      await runInParallel(instances);

    const faulty: ParallelSettlement<string> = settlementFor(
      settlements,
      'faulty',
    );
    const healthy: ParallelSettlement<string> = settlementFor(
      settlements,
      'healthy',
    );

    expect(faulty.status).toBe('rejected');
    if (faulty.status === 'rejected') {
      expect(faulty.reason.message).toBe('boom');
    }
    expect(healthy).toEqual({
      instanceId: 'healthy',
      status: 'fulfilled',
      value: 'healthy-output',
    });
  });

  it('returns one settlement per instance', async () => {
    const instances: readonly ParallelInstance<number>[] = [
      {
        instanceId: 'one',
        workingDirectory: '/wt/one',
        run: (): Promise<number> => Promise.resolve(1),
      },
      {
        instanceId: 'two',
        workingDirectory: '/wt/two',
        run: (): Promise<number> => Promise.resolve(2),
      },
      {
        instanceId: 'three',
        workingDirectory: '/wt/three',
        run: (): Promise<number> => Promise.resolve(3),
      },
    ];

    const settlements: readonly ParallelSettlement<number>[] =
      await runInParallel(instances);

    expect(settlements).toHaveLength(3);
    expect(settlements.map((s) => s.instanceId).sort()).toEqual([
      'one',
      'three',
      'two',
    ]);
  });
});
