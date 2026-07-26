import { describe, expect, it } from 'vitest';
import type { MergeOutcome } from '../ownership/merge-outcome';
import { buildHooksEventMap } from './build-hooks-event-map';
import { mergeRegistryTarget } from './merge-registry-target';
import type { RegistryTarget } from './registry-target';

const TARGET: RegistryTarget = {
  kind: 'registry',
  component: 'hooks',
  absolutePath: '/tmp/omd/.devin/hooks.v1.json',
  reportPath: '.devin/hooks.v1.json',
  shape: 'document',
  scriptPath: '/tmp/omd/.devin/hooks/omd-mode.mjs',
  hooksMap: buildHooksEventMap('node run.mjs'),
  legacyCommands: [],
};

describe('mergeRegistryTarget', () => {
  it('creates the registry when it is absent', () => {
    const outcome: MergeOutcome = mergeRegistryTarget(TARGET, null);

    expect(outcome.kind).toBe('created');
  });

  it('blocks when the existing registry is not readable JSON', () => {
    expect(mergeRegistryTarget(TARGET, 'not json').kind).toBe('blocked');
  });

  it('is unchanged when the registry already holds the claim', () => {
    const created: MergeOutcome = mergeRegistryTarget(TARGET, null);
    const content: string = created.kind === 'created' ? created.content : '';

    expect(mergeRegistryTarget(TARGET, content).kind).toBe('unchanged');
  });
});
