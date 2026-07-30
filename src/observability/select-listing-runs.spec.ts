import { describe, expect, it } from 'vitest';
import type { RunId } from './run-id';
import type { RunListingEntry } from './run-listing-entry';
import type { RunState } from './run-state';
import { selectListingRuns } from './select-listing-runs';

const NOW: number = 10000000;
const WINDOW_MS: number = 86400000;
const CAP: number = 3;

function entry(
  runId: RunId,
  state: RunState,
  lastEventAt: number,
): RunListingEntry {
  return {
    runId,
    runKind: 'single-role',
    state,
    subject: 'reviewer',
    currentStage: null,
    turnsUsed: 0,
    maxTurns: 8,
    pendingGate: null,
    failureTier: null,
    lastEventAt,
    stateEnteredAt: lastEventAt,
  };
}

function identities(entries: readonly RunListingEntry[]): readonly RunId[] {
  return entries.map((selected: RunListingEntry): RunId => selected.runId);
}

describe('selectListingRuns', () => {
  it('keeps every run without a terminal outcome', () => {
    const entries: readonly RunListingEntry[] = [
      entry('run-running', 'running', NOW - 1000),
      entry('run-stalled', 'stalled', NOW - WINDOW_MS * 10),
      entry('run-gate', 'awaiting-gate', NOW - 2000),
    ];

    expect(
      [...identities(selectListingRuns(entries, NOW, WINDOW_MS, CAP))].sort(),
    ).toEqual(['run-gate', 'run-running', 'run-stalled']);
  });

  it('keeps terminated runs only within the recency window', () => {
    const entries: readonly RunListingEntry[] = [
      entry('run-recent', 'succeeded', NOW - 1000),
      entry('run-old', 'failed', NOW - WINDOW_MS * 2),
    ];

    expect(identities(selectListingRuns(entries, NOW, WINDOW_MS, CAP))).toEqual(
      ['run-recent'],
    );
  });

  it('caps the terminated tail without dropping active runs', () => {
    const entries: readonly RunListingEntry[] = [
      entry('run-active', 'running', NOW - 9000),
      entry('run-t1', 'succeeded', NOW - 1000),
      entry('run-t2', 'succeeded', NOW - 2000),
      entry('run-t3', 'failed', NOW - 3000),
      entry('run-t4', 'succeeded', NOW - 4000),
      entry('run-t5', 'failed', NOW - 5000),
    ];

    const selected: readonly RunListingEntry[] = selectListingRuns(
      entries,
      NOW,
      WINDOW_MS,
      CAP,
    );

    expect(identities(selected)).toEqual([
      'run-t1',
      'run-t2',
      'run-t3',
      'run-active',
    ]);
  });

  it('orders the listing most recent first', () => {
    const entries: readonly RunListingEntry[] = [
      entry('run-old', 'running', NOW - 5000),
      entry('run-new', 'succeeded', NOW - 1000),
      entry('run-mid', 'awaiting-gate', NOW - 3000),
    ];

    expect(identities(selectListingRuns(entries, NOW, WINDOW_MS, CAP))).toEqual(
      ['run-new', 'run-mid', 'run-old'],
    );
  });

  it('bounds its size independently of how much history it is given', () => {
    const history: readonly RunListingEntry[] = Array.from(
      { length: 500 },
      (_unused: unknown, index: number): RunListingEntry =>
        entry(`run-${index}`, 'succeeded', NOW - index),
    );

    expect(selectListingRuns(history, NOW, WINDOW_MS, CAP)).toHaveLength(CAP);
  });

  it('yields nothing when given nothing', () => {
    expect(selectListingRuns([], NOW, WINDOW_MS, CAP)).toEqual([]);
  });
});
