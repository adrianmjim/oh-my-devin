import { execFileSync } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverRoles } from '../catalog/discover-roles';
import type { RoleDiscovery } from '../catalog/role-discovery';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { ModeState } from './mode-state';
import type { SetupResult } from './setup-result';
import { setupLayer } from './setup-layer';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function runHook(dir: string, phase: string, event: unknown): unknown {
  const stdout = execFileSync(
    process.execPath,
    [join('.devin', 'hooks', 'omd-mode.mjs'), phase],
    { cwd: dir, input: JSON.stringify(event), encoding: 'utf8' },
  );
  return JSON.parse(stdout) as unknown;
}

async function writeModeState(dir: string, state: ModeState): Promise<void> {
  await mkdir(join(dir, '.omd'), { recursive: true });
  await writeFile(
    join(dir, '.omd', 'mode.json'),
    JSON.stringify(state),
    'utf8',
  );
}

describe('setupLayer', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-setup-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('installs every layer component in a single invocation', async () => {
    const result: SetupResult = await setupLayer(dir);

    expect(await exists(join(dir, 'AGENTS.md'))).toBe(true);
    expect(
      await exists(join(dir, '.devin', 'agents', 'reviewer', 'AGENT.md')),
    ).toBe(true);
    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(true);
    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-install', 'SKILL.md')),
    ).toBe(true);
    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(true);
    expect(result.writtenPaths.length).toBeGreaterThanOrEqual(4);
  });

  it('installs an example role that the catalog can discover cleanly', async () => {
    await setupLayer(dir);

    const discovery: RoleDiscovery = await discoverRoles(dir);
    expect(discovery.errors).toEqual([]);
    expect(discovery.roles.map((r) => r.name)).toContain('reviewer');
  });

  it('installs a model-triggered delegation skill that invokes omd run', async () => {
    await setupLayer(dir);

    const skill: string = await readFile(
      join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      'utf8',
    );
    expect(skill).toContain('omd run');
    expect(skill).toContain('model');
  });

  it('carries a skill-level Exec(omd) permission allowance on the delegation skill', async () => {
    await setupLayer(dir);

    const skill: string = await readFile(
      join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      'utf8',
    );
    expect(skill).toContain('permissions:');
    expect(skill).toContain('allow:');
    expect(skill).toContain('"Exec(omd)"');
  });

  it('instructs the correspondent pattern: detach, poll status, narrate, present the gate', async () => {
    await setupLayer(dir);

    const skill: string = await readFile(
      join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      'utf8',
    );
    expect(skill).toContain('omd run <role> "<task>" --detach');
    expect(skill).toContain('omd status <run-id> --json');
    expect(skill.toLowerCase()).toContain('snapshot');
    expect(skill.toLowerCase()).toContain('restrained cadence');
    expect(skill.toLowerCase()).toContain('pending gate');
    expect(skill.toLowerCase()).toContain('outside this session');
    expect(skill.toLowerCase()).toContain('never actuate');
  });

  it('installs all six mode skills from the catalog', async () => {
    await setupLayer(dir);

    for (const skill of MODE_CATALOG) {
      expect(
        await exists(join(dir, '.devin', 'skills', skill.name, 'SKILL.md')),
      ).toBe(true);
    }
  });

  it('installs only the hooks when scoped to hooks', async () => {
    await setupLayer(dir, ['hooks']);

    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(true);
    expect(await exists(join(dir, '.devin', 'hooks', 'omd-mode.mjs'))).toBe(
      true,
    );
    expect(await exists(join(dir, 'AGENTS.md'))).toBe(false);
    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(false);
    expect(
      await exists(join(dir, '.devin', 'agents', 'reviewer', 'AGENT.md')),
    ).toBe(false);
  });

  it('installs only the skills when scoped to skills', async () => {
    await setupLayer(dir, ['skills']);

    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(true);
    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-install', 'SKILL.md')),
    ).toBe(true);
    for (const skill of MODE_CATALOG) {
      expect(
        await exists(join(dir, '.devin', 'skills', skill.name, 'SKILL.md')),
      ).toBe(true);
    }
    expect(await exists(join(dir, 'AGENTS.md'))).toBe(false);
    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(false);
  });

  it('writes a hooks event map that is valid JSON', async () => {
    await setupLayer(dir);

    const hooks: string = await readFile(
      join(dir, '.devin', 'hooks.v1.json'),
      'utf8',
    );
    const parsed: unknown = JSON.parse(hooks);
    expect(parsed).toHaveProperty('SessionStart');
    expect(parsed).toHaveProperty('Stop');
  });

  it('injects the layer banner at session start when no mode state exists', async () => {
    await setupLayer(dir);

    const output: unknown = runHook(dir, 'session-start', {
      hook_event_name: 'SessionStart',
    });
    expect(output).toEqual({
      hookSpecificOutput: {
        additionalContext: 'Oh My Devin layer active.',
      },
    });
  });

  it('injects the active mode context at session start and on each user prompt', async () => {
    await setupLayer(dir);
    await writeModeState(dir, {
      mode: 'plan',
      context:
        'plan mode active: produce a plan artifact before implementation begins.',
      verification: ['plan artifact produced'],
    });

    const expected: unknown = {
      hookSpecificOutput: {
        additionalContext:
          'Active mode: plan. plan mode active: produce a plan artifact before implementation begins.',
      },
    };
    expect(
      runHook(dir, 'session-start', { hook_event_name: 'SessionStart' }),
    ).toEqual(expected);
    expect(
      runHook(dir, 'user-prompt', {
        hook_event_name: 'UserPromptSubmit',
        prompt: 'continue',
      }),
    ).toEqual(expected);
  });

  it('falls back to the layer banner when the mode state file is unparseable', async () => {
    await setupLayer(dir);
    await mkdir(join(dir, '.omd'), { recursive: true });
    await writeFile(join(dir, '.omd', 'mode.json'), 'not json', 'utf8');

    const output: unknown = runHook(dir, 'user-prompt', {
      hook_event_name: 'UserPromptSubmit',
      prompt: 'continue',
    });
    expect(output).toEqual({
      hookSpecificOutput: {
        additionalContext: 'Oh My Devin layer active.',
      },
    });
  });

  it('falls back to default behavior when the mode state has the wrong shape', async () => {
    await setupLayer(dir);
    await mkdir(join(dir, '.omd'), { recursive: true });
    await writeFile(
      join(dir, '.omd', 'mode.json'),
      JSON.stringify({ mode: 42, context: [], verification: 'unmet' }),
      'utf8',
    );

    expect(
      runHook(dir, 'session-start', { hook_event_name: 'SessionStart' }),
    ).toEqual({
      hookSpecificOutput: {
        additionalContext: 'Oh My Devin layer active.',
      },
    });
    expect(runHook(dir, 'stop', { hook_event_name: 'Stop' })).toEqual({
      decision: 'approve',
      hookSpecificOutput: { decision: 'approve' },
    });
  });

  it('approves the stop in both decision shapes when no mode state exists', async () => {
    await setupLayer(dir);

    const output: unknown = runHook(dir, 'stop', { hook_event_name: 'Stop' });
    expect(output).toEqual({
      decision: 'approve',
      hookSpecificOutput: { decision: 'approve' },
    });
  });

  it('approves the stop once the verification criteria are cleared', async () => {
    await setupLayer(dir);
    await writeModeState(dir, {
      mode: 'team',
      context: 'team mode active.',
      verification: [],
    });

    const output: unknown = runHook(dir, 'stop', { hook_event_name: 'Stop' });
    expect(output).toEqual({
      decision: 'approve',
      hookSpecificOutput: { decision: 'approve' },
    });
  });

  it('blocks the stop in both decision shapes naming every unmet criterion', async () => {
    await setupLayer(dir);
    await writeModeState(dir, {
      mode: 'team',
      context: 'team mode active.',
      verification: [
        'pipeline terminal outcome reported',
        'review verdict recorded',
      ],
    });

    const reason: string =
      'Unmet verification criteria for mode team: pipeline terminal outcome reported; review verdict recorded';
    const output: unknown = runHook(dir, 'stop', { hook_event_name: 'Stop' });
    expect(output).toEqual({
      decision: 'block',
      reason,
      hookSpecificOutput: { decision: 'block', reason },
    });
  });
});
