import { describe, expect, it } from 'vitest';
import { canonicalJson } from '../ownership/canonical-json';
import { buildHooksEventMap } from './build-hooks-event-map';
import type { HookRegistryMerge } from './hook-registry-merge';
import { settleRegistryMerge } from './settle-registry-merge';

function input(
  shape: 'document' | 'config-key',
  existing: string | null,
): HookRegistryMerge {
  return {
    existing,
    shape,
    hooksMap: buildHooksEventMap('node run.mjs'),
    legacyCommands: [],
  };
}

describe('settleRegistryMerge', () => {
  it('creates the registry when it was absent', () => {
    const claimed: Record<string, unknown> = { Stop: [] };

    expect(
      settleRegistryMerge(input('document', null), {}, claimed, true),
    ).toEqual({
      kind: 'created',
      content: canonicalJson(claimed),
    });
  });

  it('is unchanged when the merge reproduces the existing content', () => {
    const claimed: Record<string, unknown> = { Stop: [] };
    const existing: string = canonicalJson(claimed);

    expect(
      settleRegistryMerge(input('document', existing), {}, claimed, false),
    ).toEqual({ kind: 'unchanged' });
  });

  it('updates the registry when the merge changes the content', () => {
    const claimed: Record<string, unknown> = { Stop: [] };

    expect(
      settleRegistryMerge(input('document', '{}'), {}, claimed, false),
    ).toEqual({ kind: 'updated', content: canonicalJson(claimed) });
  });

  it('nests the events under the hooks key for a config-key registry', () => {
    const claimed: Record<string, unknown> = { Stop: [] };

    expect(
      settleRegistryMerge(
        input('config-key', null),
        { other: 1 },
        claimed,
        true,
      ),
    ).toEqual({
      kind: 'created',
      content: canonicalJson({ other: 1, hooks: claimed }),
    });
  });
});
