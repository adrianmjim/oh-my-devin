import { describe, expect, it } from 'vitest';
import { mergeOutcomeReason } from './merge-outcome-reason';

describe('mergeOutcomeReason', () => {
  it('yields the reason of a preserved outcome', () => {
    expect(mergeOutcomeReason({ kind: 'preserved', reason: 'edited' })).toBe(
      'edited',
    );
  });

  it('yields the reason of a conflicted outcome', () => {
    expect(
      mergeOutcomeReason({ kind: 'conflicted', reason: 'duplicated' }),
    ).toBe('duplicated');
  });

  it('yields the reason of a blocked outcome', () => {
    expect(mergeOutcomeReason({ kind: 'blocked', reason: 'unreadable' })).toBe(
      'unreadable',
    );
  });

  it('is null for the outcomes that carry no reason', () => {
    expect(mergeOutcomeReason({ kind: 'created', content: 'x' })).toBeNull();
    expect(mergeOutcomeReason({ kind: 'updated', content: 'x' })).toBeNull();
    expect(mergeOutcomeReason({ kind: 'unchanged' })).toBeNull();
  });
});
