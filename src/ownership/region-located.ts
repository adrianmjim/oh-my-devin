import type { RegionMarker } from './region-marker';

export interface RegionLocated {
  readonly kind: 'located';
  readonly marker: RegionMarker;
  readonly before: string;
  readonly body: string;
  readonly after: string;
}
