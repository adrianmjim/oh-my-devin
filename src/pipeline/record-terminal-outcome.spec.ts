import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from '../observability/progress-event';
import type { RunObserver } from '../observability/run-observer';
import { recordTerminalOutcome } from './record-terminal-outcome';

function observer(events: ProgressEvent[]): RunObserver {
  return {
    append: (event: ProgressEvent): Promise<void> => {
      events.push(event);
      return Promise.resolve();
    },
    close: (): void => undefined,
  };
}

describe('recordTerminalOutcome', () => {
  it('appends the terminal outcome of a successful run', async () => {
    const events: ProgressEvent[] = [];

    await recordTerminalOutcome(observer(events), 42, true, null);

    expect(events).toEqual([
      {
        type: 'terminalOutcome',
        timestamp: 42,
        succeeded: true,
        failureTier: null,
      },
    ]);
  });

  it('carries the failure tier of a failed run', async () => {
    const events: ProgressEvent[] = [];

    await recordTerminalOutcome(observer(events), 1, false, 'budget');

    expect(events[0]).toMatchObject({
      succeeded: false,
      failureTier: 'budget',
    });
  });

  it('records nothing when the run has no observer', async () => {
    await expect(
      recordTerminalOutcome(undefined, 1, true, null),
    ).resolves.toBeUndefined();
  });
});
