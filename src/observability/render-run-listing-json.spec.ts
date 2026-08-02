import { describe, expect, it } from 'vitest';
import type { JsonRunListing } from './json-run-listing';
import { renderRunListingJson } from './render-run-listing-json';
import type { RunListing } from './run-listing';
import type { RunListingEntry } from './run-listing-entry';

const ENTRY: RunListingEntry = {
  runId: 'run-gate',
  runKind: 'pipeline',
  state: 'awaiting-gate',
  subject: 'feature-team',
  currentStage: 'architect',
  turnsUsed: 3,
  maxTurns: 8,
  pendingGate: 'architect',
  failureTier: null,
  lastEventAt: 2200,
  stateEnteredAt: 2200,
};

describe('renderRunListingJson', () => {
  it('carries every entry field under camelCase keys', () => {
    const listing: RunListing = { runs: [ENTRY] };

    const rendered: JsonRunListing = renderRunListingJson(listing);

    expect(rendered.runs[0]).toEqual({
      runId: 'run-gate',
      runKind: 'pipeline',
      state: 'awaiting-gate',
      subject: 'feature-team',
      currentStage: 'architect',
      turnsUsed: 3,
      maxTurns: 8,
      pendingGate: 'architect',
      failureTier: null,
      lastEventAt: 2200,
      stateEnteredAt: 2200,
    });
  });

  it('preserves the order of the listing', () => {
    const listing: RunListing = {
      runs: [ENTRY, { ...ENTRY, runId: 'run-old' }],
    };

    expect(
      renderRunListingJson(listing).runs.map(
        (entry: JsonRunListing['runs'][number]): string => entry.runId,
      ),
    ).toEqual(['run-gate', 'run-old']);
  });

  it('survives a round trip through JSON as an empty listing', () => {
    const rendered: JsonRunListing = renderRunListingJson({ runs: [] });

    expect(JSON.parse(JSON.stringify(rendered))).toEqual({ runs: [] });
  });
});
