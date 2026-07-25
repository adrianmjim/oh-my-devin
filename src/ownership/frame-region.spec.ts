import { describe, expect, it } from 'vitest';
import { digestContent } from './digest-content';
import { frameRegion } from './frame-region';
import type { RegionFraming } from './region-framing';

const FRAMING: RegionFraming = {
  id: 'rules',
  version: '1.2.3',
  style: 'markdown',
  content: 'alpha\nbeta\n',
};

describe('frameRegion', () => {
  it('frames the content between a begin and an end sentinel', () => {
    const framed: string = frameRegion(FRAMING);
    const lines: readonly string[] = framed.split('\n');

    expect(lines[0]?.startsWith('<!-- omd:begin ')).toBe(true);
    expect(lines[1]).toBe('alpha');
    expect(lines[2]).toBe('beta');
    expect(lines[3]).toBe('<!-- omd:end id=rules -->');
  });

  it('carries the digest of the framed content in the begin sentinel', () => {
    expect(frameRegion(FRAMING)).toContain(
      `digest=${digestContent('alpha\nbeta')}`,
    );
  });

  it('ends with a single trailing newline whatever the content ended with', () => {
    expect(frameRegion({ ...FRAMING, content: 'alpha\n\n\n' })).toBe(
      frameRegion({ ...FRAMING, content: 'alpha' }),
    );
    expect(frameRegion(FRAMING).endsWith('-->\n')).toBe(true);
  });

  it('frames in the comment syntax of the target format', () => {
    const framed: string = frameRegion({ ...FRAMING, style: 'yaml' });

    expect(framed.startsWith('# omd:begin ')).toBe(true);
    expect(framed.endsWith('# omd:end id=rules\n')).toBe(true);
  });
});
