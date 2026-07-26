import { describe, expect, it } from 'vitest';
import { withoutComment } from './without-comment';

describe('withoutComment', () => {
  it('drops the marker comment key', () => {
    expect(withoutComment({ $comment: 'omd:region', a: 1 })).toEqual({ a: 1 });
  });

  it('keeps the key order of the remaining entries', () => {
    expect(Object.keys(withoutComment({ b: 1, $comment: 'x', a: 2 }))).toEqual([
      'b',
      'a',
    ]);
  });

  it('copies rather than mutating the document', () => {
    const document: Record<string, unknown> = { $comment: 'x', a: 1 };

    withoutComment(document);

    expect(document['$comment']).toBe('x');
  });
});
