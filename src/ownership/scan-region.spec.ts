import { describe, expect, it } from 'vitest';
import { digestContent } from './digest-content';
import { frameRegion } from './frame-region';
import type { RegionLocated, RegionScan } from './region-scan';
import { scanRegion } from './scan-region';

const FRAMED: string = frameRegion({
  id: 'rules',
  version: '1.2.3',
  style: 'markdown',
  content: 'alpha\nbeta\n',
});

function locatedOrThrow(scan: RegionScan): RegionLocated {
  if (scan.kind !== 'located') {
    throw new Error(`expected a located region, got ${scan.kind}`);
  }
  return scan;
}

describe('scanRegion', () => {
  it('reports an absent region for content carrying no marker', () => {
    expect(scanRegion('just the user\nwriting prose\n', 'rules')).toEqual({
      kind: 'absent',
    });
  });

  it('reports an absent region for a marker belonging to another identity', () => {
    expect(scanRegion(FRAMED, 'team-default')).toEqual({ kind: 'absent' });
  });

  it('locates a region and reports its marker and body', () => {
    const located: RegionLocated = locatedOrThrow(scanRegion(FRAMED, 'rules'));

    expect(located.marker).toEqual({
      id: 'rules',
      version: '1.2.3',
      digest: digestContent('alpha\nbeta'),
    });
    expect(located.body).toBe('alpha\nbeta');
  });

  it('drops the whole line ending from the body of CRLF content', () => {
    const content: string = FRAMED.replace(/\n/g, '\r\n');

    const located: RegionLocated = locatedOrThrow(scanRegion(content, 'rules'));

    expect(located.body).toBe('alpha\r\nbeta');
    expect(digestContent(located.body)).toBe(located.marker.digest);
  });

  it('reports the bounds so the text above and below is recoverable', () => {
    const content: string = `above the region\n\n${FRAMED}\nbelow the region\n`;

    const located: RegionLocated = locatedOrThrow(scanRegion(content, 'rules'));

    expect(located.before).toBe('above the region\n\n');
    expect(located.after).toBe('\nbelow the region\n');
    expect(`${located.before}${FRAMED}${located.after}`).toBe(content);
  });

  it('reports duplicated identity as malformed', () => {
    const scan: RegionScan = scanRegion(`${FRAMED}${FRAMED}`, 'rules');

    expect(scan.kind).toBe('malformed');
  });

  it('reports a begin without an end as malformed', () => {
    const begin: string = FRAMED.split('\n')[0] ?? '';

    const scan: RegionScan = scanRegion(`${begin}\nalpha\n`, 'rules');

    expect(scan.kind).toBe('malformed');
  });

  it('reports an end without a begin as malformed', () => {
    const scan: RegionScan = scanRegion(
      'alpha\n<!-- omd:end id=rules -->\n',
      'rules',
    );

    expect(scan.kind).toBe('malformed');
  });

  it('reports an end preceding its begin as malformed', () => {
    const lines: readonly string[] = FRAMED.trimEnd().split('\n');
    const inverted: string = [
      lines[lines.length - 1],
      ...lines.slice(1, -1),
      lines[0],
    ].join('\n');

    const scan: RegionScan = scanRegion(inverted, 'rules');

    expect(scan.kind).toBe('malformed');
  });

  it('reports unreadable attributes as malformed', () => {
    const scan: RegionScan = scanRegion(
      '<!-- omd:begin id=rules version=1.2.3 -->\nalpha\n<!-- omd:end id=rules -->\n',
      'rules',
    );

    expect(scan.kind).toBe('malformed');
  });

  it('names the reason on every malformed outcome', () => {
    const malformed: readonly string[] = [
      `${FRAMED}${FRAMED}`,
      `${FRAMED.split('\n')[0] ?? ''}\nalpha\n`,
      'alpha\n<!-- omd:end id=rules -->\n',
      '<!-- omd:begin id=rules version=1.2.3 -->\nalpha\n<!-- omd:end id=rules -->\n',
    ];

    for (const content of malformed) {
      const scan: RegionScan = scanRegion(content, 'rules');

      expect(scan.kind === 'malformed' && scan.reason.length > 0).toBe(true);
    }
  });

  it('yields a value rather than throwing on arbitrary content', () => {
    const inputs: readonly string[] = ['', '\n', 'omd:begin', 'omd:end', '{}'];

    for (const content of inputs) {
      expect(() => scanRegion(content, 'rules')).not.toThrow();
    }
  });
});
