import type { RegionAbsent } from './region-absent';
import type { RegionLocated } from './region-located';
import type { RegionMalformed } from './region-malformed';

export type RegionScan = RegionAbsent | RegionLocated | RegionMalformed;
