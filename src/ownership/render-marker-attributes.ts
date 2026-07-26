import type { RegionMarker } from './region-marker';

export function renderMarkerAttributes(marker: RegionMarker): string {
  return `id=${marker.id} version=${marker.version} digest=${marker.digest}`;
}
