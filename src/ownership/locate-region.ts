import type { BeginSite } from './begin-site';
import type { RegionLocated } from './region-located';
import type { SentinelSite } from './sentinel-site';
import { TRAILING_LINE_ENDING_PATTERN } from './trailing-line-ending-pattern';

export function locateRegion(
  content: string,
  begin: BeginSite,
  end: SentinelSite,
): RegionLocated {
  const bodyStart: number = begin.start + begin.length + 1;
  const rawBody: string = content.slice(bodyStart, end.start);
  const afterStart: number = end.start + end.length;
  const afterOffset: number = content.startsWith('\n', afterStart)
    ? afterStart + 1
    : afterStart;
  return {
    kind: 'located',
    marker: begin.marker,
    before: content.slice(0, begin.start),
    body: rawBody.replace(TRAILING_LINE_ENDING_PATTERN, ''),
    after: content.slice(afterOffset),
  };
}
