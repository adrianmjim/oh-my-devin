import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { frameRegion } from '../ownership/frame-region';
import { frameUnit } from '../ownership/frame-unit';
import type { RegionFraming } from '../ownership/region-framing';
import type {
  MergeTarget,
  RefusedTarget,
  RegistryTarget,
} from './resolved-target';
import type { SetupResult, TargetReport } from './setup-result';
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

function reportFor(result: SetupResult, path: string): TargetReport {
  const report: TargetReport | undefined = result.targets.find(
    (candidate: TargetReport): boolean => candidate.path === path,
  );
  if (report === undefined) {
    throw new Error(`no report for ${path}`);
  }
  return report;
}

describe('writeResolvedTargets', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-writer-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  function rulesTarget(): MergeTarget {
    const framing: RegionFraming = {
      id: 'rules',
      version: '1.2.3',
      style: 'markdown',
      content: 'omd rules\n',
    };
    return {
      kind: 'merge',
      component: 'rules',
      absolutePath: join(dir, 'nested', 'AGENTS.md'),
      reportPath: 'AGENTS.md',
      strategy: 'container',
      framing,
    };
  }

  function skillTarget(): MergeTarget {
    return {
      kind: 'merge',
      component: 'skills',
      absolutePath: join(dir, 'skills', 'plan', 'SKILL.md'),
      reportPath: join('skills', 'plan', 'SKILL.md'),
      strategy: 'unit',
      framing: {
        id: 'skill-plan',
        version: '1.2.3',
        style: 'markdown',
        content: '---\nname: plan\n---\n\nPlan.\n',
      },
    };
  }

  function scriptTarget(): MergeTarget {
    return {
      kind: 'merge',
      component: 'hooks',
      absolutePath: join(dir, 'hooks', 'omd-mode.mjs'),
      reportPath: join('hooks', 'omd-mode.mjs'),
      strategy: 'unit',
      framing: {
        id: 'hook-script',
        version: '1.2.3',
        style: 'script',
        content: '#!/usr/bin/env node\nprocess.exit(0);\n',
      },
    };
  }

  function registryTarget(): RegistryTarget {
    const configPath: string = join(dir, 'config.json');
    return {
      kind: 'registry',
      component: 'hooks',
      absolutePath: configPath,
      reportPath: configPath,
      shape: 'config-key',
      scriptPath: join(dir, 'hooks', 'omd-mode.mjs'),
      hooksMap: buildHooksEventMap('node .devin/hooks/omd-mode.mjs'),
    };
  }

  it('creates a target that is not there yet and reports it as created', async () => {
    const target: MergeTarget = rulesTarget();

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(await readFile(target.absolutePath, 'utf8')).toBe(
      frameRegion(target.framing),
    );
    expect(reportFor(result, 'AGENTS.md').outcome).toBe('created');
  });

  it('reports an updated target apart from a created one', async () => {
    const target: MergeTarget = rulesTarget();
    await writeResolvedTargets([target]);
    const newer: MergeTarget = {
      ...target,
      framing: { ...target.framing, content: 'newer omd rules\n' },
    };

    const result: SetupResult = await writeResolvedTargets([newer]);

    expect(reportFor(result, 'AGENTS.md').outcome).toBe('updated');
  });

  it('leaves an already installed target byte-identical and reports it unchanged', async () => {
    const target: MergeTarget = rulesTarget();
    await writeResolvedTargets([target]);
    const installed: string = await readFile(target.absolutePath, 'utf8');

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(await readFile(target.absolutePath, 'utf8')).toBe(installed);
    expect(reportFor(result, 'AGENTS.md').outcome).toBe('unchanged');
  });

  it('writes nothing over a conflicted target and names the reason', async () => {
    const target: MergeTarget = skillTarget();
    const mine: string = '---\nname: plan\n---\n\nMy own plan skill.\n';
    await mkdir(dirname(target.absolutePath), { recursive: true });
    await writeFile(target.absolutePath, mine, 'utf8');

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(await readFile(target.absolutePath, 'utf8')).toBe(mine);
    const report: TargetReport = reportFor(result, target.reportPath);
    expect(report.outcome).toBe('conflicted');
    expect(report.reason).not.toBeNull();
  });

  it('claims the hook registry rather than replacing it', async () => {
    const target: RegistryTarget = registryTarget();
    await writeFile(
      target.absolutePath,
      JSON.stringify({ version: 1, token: 'secret' }),
      'utf8',
    );

    const result: SetupResult = await writeResolvedTargets([
      scriptTarget(),
      target,
    ]);

    const parsed: Record<string, unknown> = JSON.parse(
      await readFile(target.absolutePath, 'utf8'),
    ) as Record<string, unknown>;
    expect(parsed['version']).toBe(1);
    expect(parsed['token']).toBe('secret');
    expect(parsed['hooks']).toBeDefined();
    expect(reportFor(result, target.reportPath).outcome).toBe('updated');
  });

  it('withholds the registry claim when the hook script is not omd’s', async () => {
    const script: MergeTarget = scriptTarget();
    const mine: string = 'export {};\n';
    await mkdir(dirname(script.absolutePath), { recursive: true });
    await writeFile(script.absolutePath, mine, 'utf8');
    const target: RegistryTarget = registryTarget();

    const result: SetupResult = await writeResolvedTargets([script, target]);

    expect(await readFile(script.absolutePath, 'utf8')).toBe(mine);
    expect(reportFor(result, script.reportPath).outcome).toBe('conflicted');
    const report: TargetReport = reportFor(result, target.reportPath);
    expect(report.outcome).toBe('blocked');
    expect(report.reason).not.toBeNull();
    expect(await exists(target.absolutePath)).toBe(false);
  });

  it('claims the registry over an omd hook script the user has edited', async () => {
    const script: MergeTarget = scriptTarget();
    const edited: string = frameUnit(script.framing).replace(
      'process.exit(0);',
      'process.exit(1);',
    );
    await mkdir(dirname(script.absolutePath), { recursive: true });
    await writeFile(script.absolutePath, edited, 'utf8');
    const target: RegistryTarget = registryTarget();

    const result: SetupResult = await writeResolvedTargets([script, target]);

    expect(reportFor(result, script.reportPath).outcome).toBe('preserved');
    expect(reportFor(result, target.reportPath).outcome).toBe('created');
  });

  it('blocks a registry that arrives without its hook script', async () => {
    const target: RegistryTarget = registryTarget();

    const result: SetupResult = await writeResolvedTargets([target]);

    const report: TargetReport = reportFor(result, target.reportPath);
    expect(report.outcome).toBe('blocked');
    expect(report.reason).not.toBeNull();
    expect(await exists(target.absolutePath)).toBe(false);
  });

  it('lets a blocked target block only itself', async () => {
    const blocked: RegistryTarget = registryTarget();
    await writeFile(blocked.absolutePath, 'not valid json {{', 'utf8');
    const rules: MergeTarget = rulesTarget();

    const result: SetupResult = await writeResolvedTargets([
      scriptTarget(),
      blocked,
      rules,
    ]);

    expect(await readFile(blocked.absolutePath, 'utf8')).toBe(
      'not valid json {{',
    );
    const report: TargetReport = reportFor(result, blocked.reportPath);
    expect(report.outcome).toBe('blocked');
    expect(report.reason).not.toBeNull();
    expect(await exists(rules.absolutePath)).toBe(true);
    expect(reportFor(result, 'AGENTS.md').outcome).toBe('created');
  });

  it('records a report for every target it considered', async () => {
    const result: SetupResult = await writeResolvedTargets([
      rulesTarget(),
      skillTarget(),
      scriptTarget(),
      registryTarget(),
    ]);

    expect(result.targets).toHaveLength(4);
  });

  it('writes no file for a refused target and reports the refusal', async () => {
    const target: RefusedTarget = {
      kind: 'refused',
      component: 'teams',
      reason: 'no verified user-level discovery location',
    };

    const result: SetupResult = await writeResolvedTargets([target]);

    expect(result.targets).toEqual([]);
    expect(result.refusals).toEqual([
      {
        component: 'teams',
        reason: 'no verified user-level discovery location',
      },
    ]);
    expect(await exists(join(dir, 'teams'))).toBe(false);
  });
});
