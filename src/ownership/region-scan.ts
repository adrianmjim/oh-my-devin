import type { RegionMarker } from './region-marker';

export interface RegionAbsent {
  readonly kind: 'absent';
}

export interface RegionLocated {
  readonly kind: 'located';
  readonly marker: RegionMarker;
  readonly before: string;
  readonly body: string;
  readonly after: string;
}

export interface RegionMalformed {
  readonly kind: 'malformed';
  readonly reason: string;
}

export type RegionScan = RegionAbsent | RegionLocated | RegionMalformed;
