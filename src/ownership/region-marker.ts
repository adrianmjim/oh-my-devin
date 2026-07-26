export interface RegionMarker {
  readonly id: string;
  readonly version: string;
  readonly digest: string;
}

export const BEGIN_TOKEN: string = 'omd:begin';
export const END_TOKEN: string = 'omd:end';
export const REGION_TOKEN: string = 'omd:region';
export const REGION_NOTE: string =
  'maintained by `omd setup`; content outside this region is preserved';
