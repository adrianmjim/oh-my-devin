import { describe, expect, it } from 'vitest';
import type { BeginSite } from './begin-site';
import { locateRegion } from './locate-region';
import type { RegionLocated } from './region-located';
import type { SentinelSite } from './sentinel-site';

const MARKER = { id: 'rules', version: '1.2.3', digest: 'sha256:abc' };

describe('locateRegion', () => {
  it('splits the content around the region body', () => {
    const content: string = 'HEAD\nBEGIN\nbody\nEND\nTAIL\n';
    const begin: BeginSite = { start: 5, length: 5, marker: MARKER };
    const end: SentinelSite = { start: 16, length: 3 };

    const located: RegionLocated = locateRegion(content, begin, end);

    expect(located.before).toBe('HEAD\n');
    expect(located.body).toBe('body');
    expect(located.after).toBe('TAIL\n');
  });

  it('carries the marker of the begin sentinel', () => {
    const content: string = 'BEGIN\nbody\nEND\n';

    expect(
      locateRegion(
        content,
        { start: 0, length: 5, marker: MARKER },
        {
          start: 11,
          length: 3,
        },
      ).marker,
    ).toBe(MARKER);
  });

  it('drops the newline that terminates the body', () => {
    const content: string = 'BEGIN\nbody\n\nEND\n';

    expect(
      locateRegion(
        content,
        { start: 0, length: 5, marker: MARKER },
        {
          start: 12,
          length: 3,
        },
      ).body,
    ).toBe('body\n');
  });
});
