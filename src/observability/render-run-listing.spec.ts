import { describe, expect, it } from 'vitest';
import { renderRunListing } from './render-run-listing';
import type { RunListing } from './run-listing';
import type { RunListingEntry } from './run-listing-entry';

function entry(overrides: Partial<RunListingEntry>): RunListingEntry {
  return {
    runId: 'run-1',
    runKind: 'single-role',
    state: 'running',
    subject: 'reviewer',
    currentStage: null,
    turnsUsed: 2,
    maxTurns: 8,
    pendingGate: null,
    failureTier: null,
    lastEventAt: 2000,
    stateEnteredAt: 2000,
    ...overrides,
  };
}

describe('renderRunListing', () => {
  it('heads the listing with how many runs it carries', () => {
    const listing: RunListing = { runs: [entry({})] };

    expect(renderRunListing(listing).split('\n')[0]).toBe('omd status — 1 run');
  });

  it('pluralises the heading for several runs', () => {
    const listing: RunListing = {
      runs: [entry({ runId: 'run-1' }), entry({ runId: 'run-2' })],
    };

    expect(renderRunListing(listing).split('\n')[0]).toBe(
      'omd status — 2 runs',
    );
  });

  it('renders one line per run with state, subject and turn usage', () => {
    const listing: RunListing = { runs: [entry({})] };

    const line: string = renderRunListing(listing).split('\n')[1] ?? '';

    expect(line).toContain('run-1');
    expect(line).toContain('running');
    expect(line).toContain('reviewer');
    expect(line).toContain('turns 2/8');
    expect(line).toContain('since 2000');
  });

  it('identifies each run kind and carries the last-event timestamp', () => {
    const listing: RunListing = {
      runs: [
        entry({ runKind: 'pipeline', lastEventAt: 2500, stateEnteredAt: 2000 }),
      ],
    };

    const line: string = renderRunListing(listing).split('\n')[1] ?? '';

    expect(line).toContain('pipeline');
    expect(line).toContain('updated 2500');
    expect(line).toContain('since 2000');
  });

  it('names the stage and the pending gate of a run awaiting a decision', () => {
    const listing: RunListing = {
      runs: [
        entry({
          runKind: 'pipeline',
          state: 'awaiting-gate',
          subject: 'feature-team',
          currentStage: 'architect',
          pendingGate: 'architect',
        }),
      ],
    };

    const line: string = renderRunListing(listing).split('\n')[1] ?? '';

    expect(line).toContain('awaiting-gate');
    expect(line).toContain('stage architect');
    expect(line).toContain('gate architect');
  });

  it('reports a terminal failure in the failure-tier vocabulary', () => {
    const listing: RunListing = {
      runs: [entry({ state: 'failed', failureTier: 'invalid_artifact' })],
    };

    expect(renderRunListing(listing)).toContain(
      'outcome failure (invalid_artifact)',
    );
  });

  it('reports a terminal success', () => {
    const listing: RunListing = { runs: [entry({ state: 'succeeded' })] };

    expect(renderRunListing(listing)).toContain('outcome success');
  });

  it('reports a run still under way as in progress', () => {
    expect(renderRunListing({ runs: [entry({})] })).toContain(
      'outcome in progress',
    );
  });

  it('says plainly when the project has no runs to report', () => {
    expect(renderRunListing({ runs: [] })).toBe(
      'omd status — no runs recorded',
    );
  });
});
