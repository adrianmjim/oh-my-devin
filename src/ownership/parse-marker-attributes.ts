import type { RegionMarker } from './region-marker';

const ATTRIBUTE_PATTERN: RegExp = /([a-z]+)=([^\s]+)/g;

export function parseMarkerAttributes(text: string): RegionMarker | null {
  const attributes: Map<string, string> = new Map<string, string>();
  for (const match of text.matchAll(ATTRIBUTE_PATTERN)) {
    const key: string | undefined = match[1];
    const value: string | undefined = match[2];
    if (key !== undefined && value !== undefined && !attributes.has(key)) {
      attributes.set(key, value);
    }
  }
  const id: string | undefined = attributes.get('id');
  const version: string | undefined = attributes.get('version');
  const digest: string | undefined = attributes.get('digest');
  let marker: RegionMarker | null;
  if (id === undefined || version === undefined || digest === undefined) {
    marker = null;
  } else {
    marker = { id, version, digest };
  }
  return marker;
}
