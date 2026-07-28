import { describe, expect, it } from 'vitest';
import { withoutRegionMarkers } from './without-region-markers';

const BEGIN: string =
  '<!-- omd:begin id=role-architect version=0.0.0 digest=sha256:abc -->';
const END: string = '<!-- omd:end id=role-architect -->';

describe('withoutRegionMarkers', () => {
  it('removes the begin and end marker lines', () => {
    expect(
      withoutRegionMarkers([BEGIN, 'Prose.', END].join('\n'), 'markdown'),
    ).toBe('Prose.');
  });

  it('keeps the content the region encloses verbatim', () => {
    expect(
      withoutRegionMarkers(
        [BEGIN, '## Mission', '', 'You are the architect.', END].join('\n'),
        'markdown',
      ),
    ).toBe(['## Mission', '', 'You are the architect.'].join('\n'));
  });

  it('keeps the content outside the region verbatim', () => {
    expect(
      withoutRegionMarkers(
        ['Before.', BEGIN, 'Inside.', END, 'After.'].join('\n'),
        'markdown',
      ),
    ).toBe(['Before.', 'Inside.', 'After.'].join('\n'));
  });

  it('leaves a body with no markers unchanged', () => {
    const body: string = ['## Mission', '', 'You are the architect.'].join(
      '\n',
    );

    expect(withoutRegionMarkers(body, 'markdown')).toBe(body);
  });

  it('yields an empty body for content that is only markers', () => {
    expect(withoutRegionMarkers([BEGIN, END].join('\n'), 'markdown')).toBe('');
  });

  it('removes the markers of every comment syntax', () => {
    expect(
      withoutRegionMarkers(
        ['# omd:begin id=rules', 'key: value', '# omd:end id=rules'].join('\n'),
        'yaml',
      ),
    ).toBe('key: value');
  });
});
