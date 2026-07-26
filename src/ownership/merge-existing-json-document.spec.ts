import { describe, expect, it } from 'vitest';
import { EDITED_REASON } from './edited-reason';
import { mergeExistingJsonDocument } from './merge-existing-json-document';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import { NOT_JSON_REASON } from './not-json-reason';
import { renderJsonDocument } from './render-json-document';
import { UNMARKED_JSON_REASON } from './unmarked-json-reason';

function request(content: string): MergeRequest {
  return {
    existing: null,
    framing: {
      id: 'hooks',
      version: '1.2.3',
      style: 'markdown',
      content,
    },
  };
}

describe('mergeExistingJsonDocument', () => {
  it('conflicts when the existing document is not readable JSON', () => {
    expect(
      mergeExistingJsonDocument(request('{}'), 'rendered', 'not json'),
    ).toEqual({ kind: 'conflicted', reason: NOT_JSON_REASON });
  });

  it('conflicts when the existing document carries no omd marker', () => {
    expect(mergeExistingJsonDocument(request('{}'), 'rendered', '{}')).toEqual({
      kind: 'conflicted',
      reason: UNMARKED_JSON_REASON,
    });
  });

  it('preserves a document edited since it was installed', () => {
    const installed: string = renderJsonDocument(request('{}').framing, {
      a: 1,
    });
    const edited: Record<string, unknown> = JSON.parse(installed) as Record<
      string,
      unknown
    >;
    edited['a'] = 2;

    expect(
      mergeExistingJsonDocument(
        request('{}'),
        'rendered',
        JSON.stringify(edited),
      ),
    ).toEqual({ kind: 'preserved', reason: EDITED_REASON });
  });

  it('is unchanged when the render reproduces the existing document', () => {
    const installed: string = renderJsonDocument(request('{}').framing, {
      a: 1,
    });

    expect(
      mergeExistingJsonDocument(request('{}'), installed, installed),
    ).toEqual({ kind: 'unchanged' });
  });

  it('updates a pristine document the render changes', () => {
    const installed: string = renderJsonDocument(request('{}').framing, {
      a: 1,
    });
    const next: string = renderJsonDocument(request('{}').framing, { a: 1 });
    const outcome: MergeOutcome = mergeExistingJsonDocument(
      request('{}'),
      `${next} `,
      installed,
    );

    expect(outcome.kind).toBe('updated');
  });
});
