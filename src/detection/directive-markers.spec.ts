import { describe, expect, it } from 'vitest';
import type { DirectiveMarker } from './directive-marker';
import { DIRECTIVE_MARKERS } from './directive-markers';

describe('DIRECTIVE_MARKERS', () => {
  it('carries the phrases a durable directive is stated with', () => {
    expect(
      DIRECTIVE_MARKERS.map((marker: DirectiveMarker): string => marker.phrase),
    ).toContain('from now on');
  });

  it('carries the inflected forms a preference is stated with', () => {
    const phrases: readonly string[] = DIRECTIVE_MARKERS.map(
      (marker: DirectiveMarker): string => marker.phrase,
    );

    expect(phrases).toContain('prefers');
    expect(phrases).toContain('preferred');
  });

  it('weights every marker inside the unit interval', () => {
    for (const marker of DIRECTIVE_MARKERS) {
      expect(marker.phrase).toBe(marker.phrase.toLowerCase());
      expect(marker.weight).toBeGreaterThan(0);
      expect(marker.weight).toBeLessThanOrEqual(1);
    }
  });
});
