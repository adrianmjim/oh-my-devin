import { describe, expect, it } from 'vitest';
import type { RegionMarker } from './region-marker';
import { renderMarkerAttributes } from './render-marker-attributes';

const MARKER: RegionMarker = {
  id: 'rules',
  version: '1.2.3',
  digest: 'sha256:abc',
};

describe('renderMarkerAttributes', () => {
  it('renders the identity, the layer version, and the digest', () => {
    expect(renderMarkerAttributes(MARKER)).toBe(
      'id=rules version=1.2.3 digest=sha256:abc',
    );
  });
});
