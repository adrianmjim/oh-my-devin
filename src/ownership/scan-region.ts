import { parseMarkerAttributes } from './parse-marker-attributes';
import type { RegionMarker } from './region-marker';
import { BEGIN_TOKEN, END_TOKEN } from './region-marker';
import type { RegionLocated, RegionScan } from './region-scan';

interface SentinelSite {
  readonly start: number;
  readonly length: number;
}

interface BeginSite {
  readonly start: number;
  readonly length: number;
  readonly marker: RegionMarker;
}

const END_ID_PATTERN: RegExp = /id=([^\s]+)/;

const UNREADABLE: string = 'its omd region marker cannot be read';
const DUPLICATED: string = 'it carries more than one omd region of that name';
const UNTERMINATED: string = 'its omd region has no end marker';
const ORPHAN_END: string = 'its omd region end marker has no begin marker';
const OUT_OF_ORDER: string =
  'its omd region end marker precedes its begin marker';

function locate(
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
    body: rawBody.endsWith('\n') ? rawBody.slice(0, -1) : rawBody,
    after: content.slice(afterOffset),
  };
}

function resolve(
  content: string,
  begins: readonly BeginSite[],
  ends: readonly SentinelSite[],
  unreadable: boolean,
): RegionScan {
  const begin: BeginSite | undefined = begins[0];
  const end: SentinelSite | undefined = ends[0];
  let scan: RegionScan;
  if (unreadable) {
    scan = { kind: 'malformed', reason: UNREADABLE };
  } else if (begins.length > 1 || ends.length > 1) {
    scan = { kind: 'malformed', reason: DUPLICATED };
  } else if (begin === undefined && end === undefined) {
    scan = { kind: 'absent' };
  } else if (end === undefined) {
    scan = { kind: 'malformed', reason: UNTERMINATED };
  } else if (begin === undefined) {
    scan = { kind: 'malformed', reason: ORPHAN_END };
  } else if (end.start < begin.start) {
    scan = { kind: 'malformed', reason: OUT_OF_ORDER };
  } else {
    scan = locate(content, begin, end);
  }
  return scan;
}

export function scanRegion(content: string, id: string): RegionScan {
  const begins: BeginSite[] = [];
  const ends: SentinelSite[] = [];
  let unreadable: boolean = false;
  let offset: number = 0;
  for (const line of content.split('\n')) {
    if (line.includes(BEGIN_TOKEN)) {
      const marker: RegionMarker | null = parseMarkerAttributes(line);
      if (marker === null) {
        unreadable = true;
      } else if (marker.id === id) {
        begins.push({ start: offset, length: line.length, marker });
      }
    } else if (line.includes(END_TOKEN)) {
      const match: RegExpExecArray | null = END_ID_PATTERN.exec(line);
      if (match === null) {
        unreadable = true;
      } else if (match[1] === id) {
        ends.push({ start: offset, length: line.length });
      }
    }
    offset += line.length + 1;
  }
  return resolve(content, begins, ends, unreadable);
}
