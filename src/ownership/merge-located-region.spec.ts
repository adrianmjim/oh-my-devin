import { describe, expect, it } from 'vitest';
import { digestContent } from './digest-content';
import { mergeLocatedRegion } from './merge-located-region';
import type { MergeOutcome } from './merge-outcome';
import { EDITED_REASON } from './merge-outcome';
import type { RegionLocated } from './region-scan';

function located(digest: string): RegionLocated {
  return {
    kind: 'located',
    marker: { id: 'omd-rules', version: '1.2.3', digest },
    before: 'above\n',
    body: 'old body',
    after: '\nbelow\n',
  };
}

describe('mergeLocatedRegion', () => {
  it('replaces a pristine region whose merged content differs', () => {
    const outcome: MergeOutcome = mergeLocatedRegion({
      existing: 'above\nold body\nbelow\n',
      located: located(digestContent('old body')),
      digestInput: 'old body',
      merged: 'above\nnew body\nbelow\n',
    });

    expect(outcome).toEqual({
      kind: 'updated',
      content: 'above\nnew body\nbelow\n',
    });
  });

  it('reports unchanged when the merged content equals the existing content', () => {
    const existing: string = 'above\nold body\nbelow\n';

    const outcome: MergeOutcome = mergeLocatedRegion({
      existing,
      located: located(digestContent('old body')),
      digestInput: 'old body',
      merged: existing,
    });

    expect(outcome).toEqual({ kind: 'unchanged' });
  });

  it('preserves a region whose digest no longer matches', () => {
    const outcome: MergeOutcome = mergeLocatedRegion({
      existing: 'above\nedited body\nbelow\n',
      located: located(digestContent('shipped body')),
      digestInput: 'edited body',
      merged: 'above\nnew body\nbelow\n',
    });

    expect(outcome).toEqual({ kind: 'preserved', reason: EDITED_REASON });
  });
});
