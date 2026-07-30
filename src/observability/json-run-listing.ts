import type { JsonRunListingEntry } from './json-run-listing-entry';

export interface JsonRunListing {
  readonly runs: readonly JsonRunListingEntry[];
}
