import type { RegionMarker } from './region-marker';

export interface BeginSite {
  readonly start: number;
  readonly length: number;
  readonly marker: RegionMarker;
}
