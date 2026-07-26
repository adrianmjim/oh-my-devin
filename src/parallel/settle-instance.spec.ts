import { describe, expect, it } from 'vitest';
import type { ParallelSettlement } from './parallel-settlement';
import { settleInstance } from './settle-instance';

describe('settleInstance', () => {
  it('fulfils with the value the instance produced', async () => {
    const settlement: ParallelSettlement<string> = await settleInstance({
      instanceId: 'a',
      workingDirectory: '/a',
      run: (): Promise<string> => Promise.resolve('done'),
    });

    expect(settlement).toEqual({
      instanceId: 'a',
      status: 'fulfilled',
      value: 'done',
    });
  });

  it('rejects with the error the instance threw', async () => {
    const failure: Error = new Error('boom');

    const settlement: ParallelSettlement<string> = await settleInstance({
      instanceId: 'a',
      workingDirectory: '/a',
      run: (): Promise<string> => Promise.reject(failure),
    });

    expect(settlement).toEqual({
      instanceId: 'a',
      status: 'rejected',
      reason: failure,
    });
  });

  it('never rejects itself', async () => {
    await expect(
      settleInstance({
        instanceId: 'a',
        workingDirectory: '/a',
        run: (): Promise<string> => Promise.reject(new Error('boom')),
      }),
    ).resolves.toBeDefined();
  });
});
