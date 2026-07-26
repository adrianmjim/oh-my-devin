import { describe, expect, it } from 'vitest';
import type { MergeOutcome } from '../ownership/merge-outcome';
import { buildHooksEventMap } from './build-hooks-event-map';
import type { HookRegistryMerge } from './hook-registry-merge';
import { mergeHookDocument } from './merge-hook-document';
import { UNREADABLE_HOOKS_KEY_REASON } from './unreadable-hooks-key-reason';

function input(shape: 'document' | 'config-key'): HookRegistryMerge {
  return {
    existing: null,
    shape,
    hooksMap: buildHooksEventMap('node run.mjs'),
    legacyCommands: [],
  };
}

describe('mergeHookDocument', () => {
  it('claims the events of an absent document', () => {
    const outcome: MergeOutcome = mergeHookDocument(
      input('document'),
      {},
      true,
    );

    expect(outcome.kind).toBe('created');
  });

  it('blocks when the hooks key holds no event map', () => {
    expect(
      mergeHookDocument(input('config-key'), { hooks: [] }, false),
    ).toEqual({
      kind: 'blocked',
      reason: UNREADABLE_HOOKS_KEY_REASON,
    });
  });

  it('blocks with the claim reason when an event cannot be extended', () => {
    const outcome: MergeOutcome = mergeHookDocument(
      input('document'),
      { Stop: 'not-a-list' },
      false,
    );

    expect(outcome.kind).toBe('blocked');
  });
});
