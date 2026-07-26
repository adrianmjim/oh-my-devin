import { digestContent } from './digest-content';
import { normalizeForDigest } from './normalize-for-digest';
import type { RegionFraming } from './region-framing';
import type { RegionMarker } from './region-marker';
import { renderBeginSentinel } from './render-begin-sentinel';
import { renderEndSentinel } from './render-end-sentinel';

export function frameRegion(framing: RegionFraming): string {
  const body: string = normalizeForDigest(framing.content);
  const marker: RegionMarker = {
    id: framing.id,
    version: framing.version,
    digest: digestContent(body),
  };
  const begin: string = renderBeginSentinel(framing.style, marker);
  const end: string = renderEndSentinel(framing.style, framing.id);
  return `${begin}\n${body}\n${end}\n`;
}
