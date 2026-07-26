import { describe, expect, it } from 'vitest';
import { canonicalJson } from './canonical-json';
import { digestContent } from './digest-content';
import type { RegionFraming } from './region-framing';
import { renderJsonDocument } from './render-json-document';

const FRAMING: RegionFraming = {
  id: 'hooks',
  version: '1.2.3',
  style: 'markdown',
  content: '{}',
};

describe('renderJsonDocument', () => {
  it('leads the document with a marker comment', () => {
    const rendered: Record<string, unknown> = JSON.parse(
      renderJsonDocument(FRAMING, { a: 1 }),
    ) as Record<string, unknown>;

    expect(Object.keys(rendered)[0]).toBe('$comment');
    expect(String(rendered['$comment'])).toContain('omd:region');
    expect(String(rendered['$comment'])).toContain('id=hooks');
  });

  it('digests the document without its own comment', () => {
    const rendered: Record<string, unknown> = JSON.parse(
      renderJsonDocument(FRAMING, { a: 1 }),
    ) as Record<string, unknown>;

    expect(String(rendered['$comment'])).toContain(
      digestContent(canonicalJson({ a: 1 })),
    );
  });

  it('keeps the document body beside the marker', () => {
    const rendered: Record<string, unknown> = JSON.parse(
      renderJsonDocument(FRAMING, { a: 1 }),
    ) as Record<string, unknown>;

    expect(rendered['a']).toBe(1);
  });

  it('drops a marker the incoming document already carried', () => {
    const rendered: Record<string, unknown> = JSON.parse(
      renderJsonDocument(FRAMING, { $comment: 'stale', a: 1 }),
    ) as Record<string, unknown>;

    expect(String(rendered['$comment'])).toContain('omd:region');
  });
});
