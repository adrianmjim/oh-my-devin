import { BEGIN_TOKEN } from './begin-token';
import type { BeginSite } from './begin-site';
import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimitersFor } from './comment-delimiters-for';
import type { CommentStyle } from './comment-style';
import { END_ID_PATTERN } from './end-id-pattern';
import { END_TOKEN } from './end-token';
import { parseMarkerAttributes } from './parse-marker-attributes';
import type { RegionMarker } from './region-marker';
import type { RegionScan } from './region-scan';
import { resolveRegionScan } from './resolve-region-scan';
import type { SentinelSite } from './sentinel-site';

export function scanRegion(
  content: string,
  id: string,
  style: CommentStyle,
): RegionScan {
  const delimiters: CommentDelimiters = commentDelimitersFor(style);
  const beginSentinel: string = `${delimiters.open}${BEGIN_TOKEN} `;
  const endSentinel: string = `${delimiters.open}${END_TOKEN} `;
  const begins: BeginSite[] = [];
  const ends: SentinelSite[] = [];
  let unreadable: boolean = false;
  let offset: number = 0;
  for (const line of content.split('\n')) {
    if (line.startsWith(beginSentinel)) {
      const marker: RegionMarker | null = parseMarkerAttributes(line);
      if (marker === null) {
        unreadable = true;
      } else if (marker.id === id) {
        begins.push({ start: offset, length: line.length, marker });
      }
    } else if (line.startsWith(endSentinel)) {
      const match: RegExpExecArray | null = END_ID_PATTERN.exec(line);
      if (match === null) {
        unreadable = true;
      } else if (match[1] === id) {
        ends.push({ start: offset, length: line.length });
      }
    }
    offset += line.length + 1;
  }
  return resolveRegionScan(content, begins, ends, unreadable);
}
