import type { RunListing } from './run-listing';
import type { RunListingEntry } from './run-listing-entry';

export function renderRunListing(listing: RunListing): string {
  function outcomeOf(entry: RunListingEntry): string {
    let outcome: string = 'in progress';
    if (entry.state === 'succeeded') {
      outcome = 'success';
    } else if (entry.state === 'failed') {
      outcome = `failure (${entry.failureTier ?? 'unknown'})`;
    }
    return outcome;
  }
  function lineOf(entry: RunListingEntry): string {
    return [
      entry.runId,
      entry.runKind,
      entry.state,
      entry.subject,
      `stage ${entry.currentStage ?? '(n/a)'}`,
      `turns ${entry.turnsUsed}/${entry.maxTurns}`,
      `gate ${entry.pendingGate ?? '(none)'}`,
      `outcome ${outcomeOf(entry)}`,
      `since ${entry.stateEnteredAt}`,
      `updated ${entry.lastEventAt}`,
    ].join('  ');
  }
  let rendered: string = 'omd status — no active or recent runs';
  if (listing.runs.length > 0) {
    const noun: string = listing.runs.length === 1 ? 'run' : 'runs';
    rendered = [
      `omd status — ${listing.runs.length} ${noun}`,
      ...listing.runs.map(lineOf),
    ].join('\n');
  }
  return rendered;
}
