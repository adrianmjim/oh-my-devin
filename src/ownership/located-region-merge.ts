import type { RegionLocated } from './region-located';

export interface LocatedRegionMerge {
  readonly existing: string;
  readonly located: RegionLocated;
  readonly digestInput: string;
  readonly merged: string;
}
