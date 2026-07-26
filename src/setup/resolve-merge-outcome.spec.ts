import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { MergeOutcome } from '../ownership/merge-outcome';
import { buildHooksEventMap } from './build-hooks-event-map';
import type { MergeTarget } from './merge-target';
import type { RegistryTarget } from './registry-target';
import { resolveMergeOutcome } from './resolve-merge-outcome';
import type { TargetOutcome } from './target-outcome';
import { UNOWNED_HOOK_SCRIPT_REASON } from './unowned-hook-script-reason';

describe('resolveMergeOutcome', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'omd-resolve-outcome-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('merges a file target against what is on disk', async () => {
    const target: MergeTarget = {
      kind: 'merge',
      component: 'rules',
      absolutePath: join(directory, 'rules.md'),
      reportPath: 'rules.md',
      strategy: 'unit',
      framing: {
        id: 'rules',
        version: '1.2.3',
        style: 'markdown',
        content: 'body',
      },
    };

    const outcome: MergeOutcome = await resolveMergeOutcome(
      target,
      new Map<string, TargetOutcome>(),
    );

    expect(outcome.kind).toBe('created');
  });

  it('blocks a registry target whose script omd does not own', async () => {
    const scriptPath: string = join(directory, 'omd-mode.mjs');
    const target: RegistryTarget = {
      kind: 'registry',
      component: 'hooks',
      absolutePath: join(directory, 'hooks.v1.json'),
      reportPath: 'hooks.v1.json',
      shape: 'document',
      scriptPath,
      hooksMap: buildHooksEventMap('node run.mjs'),
      legacyCommands: [],
    };

    expect(
      await resolveMergeOutcome(target, new Map<string, TargetOutcome>()),
    ).toEqual({ kind: 'blocked', reason: UNOWNED_HOOK_SCRIPT_REASON });
  });

  it('merges a registry target whose script omd owns', async () => {
    const scriptPath: string = join(directory, 'omd-mode.mjs');
    const target: RegistryTarget = {
      kind: 'registry',
      component: 'hooks',
      absolutePath: join(directory, 'hooks.v1.json'),
      reportPath: 'hooks.v1.json',
      shape: 'document',
      scriptPath,
      hooksMap: buildHooksEventMap('node run.mjs'),
      legacyCommands: [],
    };

    const outcome: MergeOutcome = await resolveMergeOutcome(
      target,
      new Map<string, TargetOutcome>([[scriptPath, 'created']]),
    );

    expect(outcome.kind).toBe('created');
  });
});
