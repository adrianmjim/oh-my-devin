import type { RunListingEntry } from './run-listing-entry';

export interface RunListing {
  readonly runs: readonly RunListingEntry[];
}
