import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from '../observability/progress-event';
import type { RunObserver } from '../observability/run-observer';
import { recordTurnCompleted } from './record-turn-completed';

function observer(events: ProgressEvent[]): RunObserver {
  return {
    append: (event: ProgressEvent): Promise<void> => {
      events.push(event);
      return Promise.resolve();
    },
    claim: (): Promise<void> => Promise.resolve(),
    close: (): void => undefined,
  };
}

describe('recordTurnCompleted', () => {
  it('marks the first turn as a launch', async () => {
    const events: ProgressEvent[] = [];

    await recordTurnCompleted(observer(events), 10, 0);

    expect(events).toEqual([
      {
        type: 'turnCompleted',
        timestamp: 10,
        turnIndex: 0,
        boundary: 'launch',
      },
    ]);
  });

  it('marks every later turn as a resume', async () => {
    const events: ProgressEvent[] = [];

    await recordTurnCompleted(observer(events), 11, 1);

    expect(events[0]).toMatchObject({ turnIndex: 1, boundary: 'resume' });
  });

  it('records nothing when the run has no recorder', async () => {
    await expect(recordTurnCompleted(undefined, 1, 0)).resolves.toBeUndefined();
  });
});
