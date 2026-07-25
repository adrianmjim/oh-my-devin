import type { RegionFraming } from './region-framing';

export interface MergeRequest {
  readonly existing: string | null;
  readonly framing: RegionFraming;
}
