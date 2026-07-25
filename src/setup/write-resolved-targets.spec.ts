import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type {
  FileTarget,
  HooksMergeTarget,
  RefusedTarget,
} from './resolved-target';
import type { SetupResult } from './setup-result';
import { buildHooksEventMap } from './setup-templates';
import { writeResolvedTargets } from './write-resolved-targets';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('writeResolvedTargets', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-writer-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes a file target at its absolute path and reports the report path', async () => {
    const target: FileTarget = {
      kind: 'file',
      component: 'rules',
      absolutePath: join(dir, 'nested', 'AGENTS.md'),
      reportPath: 'AGENTS.md',
      content: 'hello rules',
    };

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(await readFile(target.absolutePath, 'utf8')).toBe('hello rules');
    expect(result.writtenPaths).toContain('AGENTS.md');
    expect(result.refusals).toEqual([]);
  });

  it('merges hooks into an existing config, preserving its other keys', async () => {
    const configPath: string = join(dir, 'config.json');
    await writeFile(
      configPath,
      JSON.stringify({ version: 1, token: 'secret' }),
      'utf8',
    );
    const scriptPath: string = join(dir, 'hooks', 'omd-mode.mjs');
    const target: HooksMergeTarget = {
      kind: 'hooks-merge',
      component: 'hooks',
      scriptAbsolutePath: scriptPath,
      scriptReportPath: scriptPath,
      scriptContent: 'SCRIPT BODY',
      configAbsolutePath: configPath,
      configReportPath: configPath,
      hooksMap: buildHooksEventMap(`node ${scriptPath}`),
    };

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(await readFile(scriptPath, 'utf8')).toBe('SCRIPT BODY');
    const parsed: Record<string, unknown> = JSON.parse(
      await readFile(configPath, 'utf8'),
    ) as Record<string, unknown>;
    expect(parsed['version']).toBe(1);
    expect(parsed['token']).toBe('secret');
    expect(parsed['hooks']).toEqual(target.hooksMap);
    expect(result.writtenPaths).toContain(scriptPath);
    expect(result.writtenPaths).toContain(configPath);
  });

  it('creates the config from scratch when none exists', async () => {
    const configPath: string = join(dir, 'config.json');
    const scriptPath: string = join(dir, 'hooks', 'omd-mode.mjs');
    const target: HooksMergeTarget = {
      kind: 'hooks-merge',
      component: 'hooks',
      scriptAbsolutePath: scriptPath,
      scriptReportPath: scriptPath,
      scriptContent: 'SCRIPT BODY',
      configAbsolutePath: configPath,
      configReportPath: configPath,
      hooksMap: buildHooksEventMap(`node ${scriptPath}`),
    };

    await writeResolvedTargets([target]);

    const parsed: Record<string, unknown> = JSON.parse(
      await readFile(configPath, 'utf8'),
    ) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual(['hooks']);
  });

  it('refuses to clobber an invalid config without orphaning the hook script', async () => {
    const configPath: string = join(dir, 'config.json');
    await writeFile(configPath, 'not valid json {{', 'utf8');
    const scriptPath: string = join(dir, 'hooks', 'omd-mode.mjs');
    const target: HooksMergeTarget = {
      kind: 'hooks-merge',
      component: 'hooks',
      scriptAbsolutePath: scriptPath,
      scriptReportPath: scriptPath,
      scriptContent: 'SCRIPT BODY',
      configAbsolutePath: configPath,
      configReportPath: configPath,
      hooksMap: buildHooksEventMap(`node ${scriptPath}`),
    };

    await expect(writeResolvedTargets([target])).rejects.toThrow();
    expect(await exists(scriptPath)).toBe(false);
    expect(await readFile(configPath, 'utf8')).toBe('not valid json {{');
  });

  it('writes no file for a refused target and reports the refusal', async () => {
    const target: RefusedTarget = {
      kind: 'refused',
      component: 'teams',
      reason: 'no verified user-level discovery location',
    };

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(result.writtenPaths).toEqual([]);
    expect(result.refusals).toEqual([
      {
        component: 'teams',
        reason: 'no verified user-level discovery location',
      },
    ]);
    expect(await exists(join(dir, 'teams'))).toBe(false);
  });
});
