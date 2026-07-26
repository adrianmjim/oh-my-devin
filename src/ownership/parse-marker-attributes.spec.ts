import { describe, expect, it } from 'vitest';
import { parseMarkerAttributes } from './parse-marker-attributes';
import type { RegionMarker } from './region-marker';
import { renderMarkerAttributes } from './render-marker-attributes';

describe('parseMarkerAttributes', () => {
  it('reads back what the renderer wrote', () => {
    const marker: RegionMarker = {
      id: 'rules',
      version: '1.2.3',
      digest: 'sha256:abc',
    };

    expect(parseMarkerAttributes(renderMarkerAttributes(marker))).toEqual(
      marker,
    );
  });

  it('reads attributes out of a surrounding sentinel line and its note', () => {
    const line: string =
      '<!-- omd:begin id=rules version=1.2.3 digest=sha256:abc | maintained by omd setup -->';

    expect(parseMarkerAttributes(line)).toEqual({
      id: 'rules',
      version: '1.2.3',
      digest: 'sha256:abc',
    });
  });

  it('reports unreadable attributes when one is missing', () => {
    expect(parseMarkerAttributes('id=rules version=1.2.3')).toBeNull();
  });

  it('reports unreadable attributes when the text carries none', () => {
    expect(parseMarkerAttributes('just prose')).toBeNull();
  });
});
