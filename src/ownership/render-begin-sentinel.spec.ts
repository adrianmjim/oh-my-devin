import { describe, expect, it } from 'vitest';
import type { RegionMarker } from './region-marker';
import { renderBeginSentinel } from './render-begin-sentinel';

const MARKER: RegionMarker = {
  id: 'rules',
  version: '1.2.3',
  digest: 'sha256:abc',
};

describe('renderBeginSentinel', () => {
  it('renders an html comment for markdown', () => {
    expect(renderBeginSentinel('markdown', MARKER)).toBe(
      '<!-- omd:begin id=rules version=1.2.3 digest=sha256:abc | maintained by `omd setup`; content outside this region is preserved -->',
    );
  });

  it('renders a hash comment for yaml', () => {
    expect(renderBeginSentinel('yaml', MARKER).startsWith('# omd:begin ')).toBe(
      true,
    );
  });

  it('renders a double-slash comment for a script', () => {
    expect(
      renderBeginSentinel('script', MARKER).startsWith('// omd:begin '),
    ).toBe(true);
  });

  it('carries the identity, the version, and the digest in every syntax', () => {
    for (const style of ['markdown', 'yaml', 'script'] as const) {
      const rendered: string = renderBeginSentinel(style, MARKER);

      expect(rendered).toContain('id=rules');
      expect(rendered).toContain('version=1.2.3');
      expect(rendered).toContain('digest=sha256:abc');
    }
  });

  it('stays on a single line in every syntax', () => {
    for (const style of ['markdown', 'yaml', 'script'] as const) {
      expect(renderBeginSentinel(style, MARKER)).not.toContain('\n');
    }
  });
});
