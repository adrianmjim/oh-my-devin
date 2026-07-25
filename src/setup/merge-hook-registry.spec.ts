import { describe, expect, it } from 'vitest';
import type { MergeOutcome } from '../ownership/merge-outcome';
import type { HookRegistryMerge } from './merge-hook-registry';
import { mergeHookRegistry } from './merge-hook-registry';
import type { HooksEventMap } from './setup-templates';
import { buildHooksEventMap } from './setup-templates';

const OMD_MAP: HooksEventMap = buildHooksEventMap(
  'node .devin/hooks/omd-mode.mjs',
);
const FOREIGN_ENTRY: Record<string, unknown> = {
  hooks: [{ type: 'command', command: 'node ./scripts/my-guard.mjs' }],
};

function documentMerge(existing: string | null): HookRegistryMerge {
  return { existing, shape: 'document', hooksMap: OMD_MAP };
}

function configMerge(existing: string | null): HookRegistryMerge {
  return { existing, shape: 'config-key', hooksMap: OMD_MAP };
}

function written(outcome: MergeOutcome): Record<string, unknown> {
  if (outcome.kind !== 'created' && outcome.kind !== 'updated') {
    throw new Error(`expected written content, got ${outcome.kind}`);
  }
  return JSON.parse(outcome.content) as Record<string, unknown>;
}

describe('mergeHookRegistry', () => {
  it('creates the registry document when none exists', () => {
    const outcome: MergeOutcome = mergeHookRegistry(documentMerge(null));

    expect(outcome.kind).toBe('created');
    expect(written(outcome)['Stop']).toEqual([...OMD_MAP.Stop]);
  });

  it('keeps an unclaimed event of an existing registry document', () => {
    const existing: string = JSON.stringify({ PreToolUse: [FOREIGN_ENTRY] });

    const outcome: MergeOutcome = mergeHookRegistry(documentMerge(existing));

    expect(outcome.kind).toBe('updated');
    expect(written(outcome)['PreToolUse']).toEqual([FOREIGN_ENTRY]);
    expect(written(outcome)['Stop']).toEqual([...OMD_MAP.Stop]);
  });

  it('reports unchanged when the registry document already carries the claim', () => {
    const first: MergeOutcome = mergeHookRegistry(documentMerge(null));

    const second: MergeOutcome = mergeHookRegistry(
      documentMerge(first.kind === 'created' ? first.content : ''),
    );

    expect(second).toEqual({ kind: 'unchanged' });
  });

  it('creates the configuration with only the hooks key when none exists', () => {
    const outcome: MergeOutcome = mergeHookRegistry(configMerge(null));

    expect(Object.keys(written(outcome))).toEqual(['hooks']);
  });

  it('keeps the sibling keys of an existing configuration', () => {
    const existing: string = JSON.stringify({ version: 1, token: 'secret' });

    const outcome: MergeOutcome = mergeHookRegistry(configMerge(existing));

    const document: Record<string, unknown> = written(outcome);
    expect(document['version']).toBe(1);
    expect(document['token']).toBe('secret');
    expect(document['hooks']).toEqual({
      SessionStart: [...OMD_MAP.SessionStart],
      UserPromptSubmit: [...OMD_MAP.UserPromptSubmit],
      Stop: [...OMD_MAP.Stop],
    });
  });

  it('keeps a foreign entry that already sits under the hooks key', () => {
    const existing: string = JSON.stringify({
      hooks: { Stop: [FOREIGN_ENTRY] },
    });

    const outcome: MergeOutcome = mergeHookRegistry(configMerge(existing));

    const hooks: Record<string, unknown> = written(outcome)['hooks'] as Record<
      string,
      unknown
    >;
    expect(hooks['Stop']).toEqual([FOREIGN_ENTRY, ...OMD_MAP.Stop]);
  });

  it('reports unchanged when the configuration already carries the claim', () => {
    const first: MergeOutcome = mergeHookRegistry(
      configMerge(JSON.stringify({ version: 1 })),
    );

    const second: MergeOutcome = mergeHookRegistry(
      configMerge(first.kind === 'updated' ? first.content : ''),
    );

    expect(second).toEqual({ kind: 'unchanged' });
  });

  it('blocks on input it cannot parse', () => {
    const outcome: MergeOutcome = mergeHookRegistry(
      configMerge('not valid json {{'),
    );

    expect(outcome.kind).toBe('blocked');
    expect(outcome.kind === 'blocked' && outcome.reason.length > 0).toBe(true);
  });

  it('blocks on a document that is not a json object', () => {
    expect(mergeHookRegistry(documentMerge('[1, 2, 3]')).kind).toBe('blocked');
  });

  it('blocks when the claimed key holds something other than an object', () => {
    const existing: string = JSON.stringify({ hooks: ['not an event map'] });

    expect(mergeHookRegistry(configMerge(existing)).kind).toBe('blocked');
  });

  it('blocks when a claimed event holds something other than a list', () => {
    const existing: string = JSON.stringify({ Stop: { not: 'a list' } });

    expect(mergeHookRegistry(documentMerge(existing)).kind).toBe('blocked');
  });

  it('writes nothing when it blocks', () => {
    const blocked: MergeOutcome = mergeHookRegistry(configMerge('{{'));

    expect(Object.keys(blocked)).toEqual(['kind', 'reason']);
  });
});
