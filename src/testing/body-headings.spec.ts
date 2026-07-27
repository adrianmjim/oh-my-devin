import { describe, expect, it } from 'vitest';
import { bodyHeadings } from './body-headings';

describe('bodyHeadings', () => {
  it('lists the second-level headings in document order', () => {
    const body: string = ['## Mission', 'text', '', '## Boundaries', ''].join(
      '\n',
    );

    expect(bodyHeadings(body)).toEqual(['Mission', 'Boundaries']);
  });

  it('ignores prose, deeper headings, and heading-shaped text', () => {
    const body: string = [
      'A body without headings.',
      '### Deeper',
      '#Not a heading',
      'A line mentioning ## Mission mid-sentence.',
    ].join('\n');

    expect(bodyHeadings(body)).toEqual([]);
  });

  it('returns nothing for an empty body', () => {
    expect(bodyHeadings('')).toEqual([]);
  });
});
