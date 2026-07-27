import { describe, expect, it } from 'vitest';
import { isRegionMarkerLine } from './is-region-marker-line';

describe('isRegionMarkerLine', () => {
  it('recognizes a begin sentinel line', () => {
    expect(
      isRegionMarkerLine(
        '<!-- omd:begin id=role-architect version=0.0.0 digest=sha256:abc -->',
        'markdown',
      ),
    ).toBe(true);
  });

  it('recognizes an end sentinel line', () => {
    expect(
      isRegionMarkerLine('<!-- omd:end id=role-architect -->', 'markdown'),
    ).toBe(true);
  });

  it('recognizes the sentinels of every comment syntax', () => {
    expect(isRegionMarkerLine('# omd:begin id=rules', 'yaml')).toBe(true);
    expect(isRegionMarkerLine('# omd:end id=rules', 'yaml')).toBe(true);
    expect(isRegionMarkerLine('// omd:begin id=rules', 'script')).toBe(true);
    expect(isRegionMarkerLine('// omd:end id=rules', 'script')).toBe(true);
  });

  it('does not recognize a line that carries the token mid-sentence', () => {
    expect(
      isRegionMarkerLine(
        'The installer writes <!-- omd:begin id=rules --> as the first line.',
        'markdown',
      ),
    ).toBe(false);
  });

  it('does not recognize ordinary prose', () => {
    expect(
      isRegionMarkerLine('You are the architect. You turn a', 'markdown'),
    ).toBe(false);
  });

  it('does not recognize a sentinel written in another comment syntax', () => {
    expect(isRegionMarkerLine('# omd:begin id=rules', 'markdown')).toBe(false);
  });
});
