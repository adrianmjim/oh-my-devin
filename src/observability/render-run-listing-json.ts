import type { JsonRunListing } from './json-run-listing';
import type { JsonRunListingEntry } from './json-run-listing-entry';
import type { RunListing } from './run-listing';
import type { RunListingEntry } from './run-listing-entry';

export function renderRunListingJson(listing: RunListing): JsonRunListing {
  return {
    runs: listing.runs.map((entry: RunListingEntry): JsonRunListingEntry => ({
      runId: entry.runId,
      runKind: entry.runKind,
      state: entry.state,
      subject: entry.subject,
      currentStage: entry.currentStage,
      turnsUsed: entry.turnsUsed,
      maxTurns: entry.maxTurns,
      pendingGate: entry.pendingGate,
      failureTier: entry.failureTier,
      lastEventAt: entry.lastEventAt,
      stateEnteredAt: entry.stateEnteredAt,
    })),
  };
}
