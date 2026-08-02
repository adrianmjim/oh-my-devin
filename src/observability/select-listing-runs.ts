import type { RunListingEntry } from './run-listing-entry';

export function selectListingRuns(
  entries: readonly RunListingEntry[],
  now: number,
  windowMs: number,
  cap: number,
): readonly RunListingEntry[] {
  function byRecency(a: RunListingEntry, b: RunListingEntry): number {
    return b.lastEventAt - a.lastEventAt;
  }
  function isTerminated(candidate: RunListingEntry): boolean {
    return candidate.state === 'succeeded' || candidate.state === 'failed';
  }
  const ordered: readonly RunListingEntry[] = [...entries].sort(byRecency);
  const active: readonly RunListingEntry[] = ordered.filter(
    (candidate: RunListingEntry): boolean => !isTerminated(candidate),
  );
  const terminated: readonly RunListingEntry[] = ordered
    .filter(isTerminated)
    .filter(
      (candidate: RunListingEntry): boolean =>
        candidate.lastEventAt <= now && now - candidate.lastEventAt <= windowMs,
    )
    .slice(0, cap);
  return [...active, ...terminated].sort(byRecency);
}
