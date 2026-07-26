import { digestContent } from './digest-content';
import { normalizeForDigest } from './normalize-for-digest';
import type { RegionFraming } from './region-framing';
import type { RegionMarker } from './region-marker';
import { renderBeginSentinel } from './render-begin-sentinel';
import { renderEndSentinel } from './render-end-sentinel';
import type { SplitContent } from './split-preamble';
import { splitPreamble } from './split-preamble';

export function frameUnit(framing: RegionFraming): string {
  const normalized: string = normalizeForDigest(framing.content);
  const split: SplitContent = splitPreamble(normalized);
  const marker: RegionMarker = {
    id: framing.id,
    version: framing.version,
    digest: digestContent(normalized),
  };
  const begin: string = renderBeginSentinel(framing.style, marker);
  const end: string = renderEndSentinel(framing.style, framing.id);
  return `${split.preamble}${begin}\n${split.rest}\n${end}\n`;
}
