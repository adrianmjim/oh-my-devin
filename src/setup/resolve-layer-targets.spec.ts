import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from './layer-component';
import type {
  FileTarget,
  HooksMergeTarget,
  RefusedTarget,
  ResolvedTarget,
} from './resolved-target';
import { resolveLayerTargets } from './resolve-layer-targets';

const PROJECT: string = join('/tmp', 'omd-project');
const USER_CONFIG: string = join('/home', 'someone', '.config', 'devin');

function files(targets: readonly ResolvedTarget[]): readonly FileTarget[] {
  return targets.filter(
    (t: ResolvedTarget): t is FileTarget => t.kind === 'file',
  );
}

function byAbsolutePath(
  targets: readonly ResolvedTarget[],
  absolutePath: string,
): FileTarget | undefined {
  return files(targets).find(
    (t: FileTarget): boolean => t.absolutePath === absolutePath,
  );
}

describe('resolveLayerTargets', () => {
  it('reproduces today’s project-relative file locations at project level', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ALL_LAYER_COMPONENTS,
    });

    expect(
      targets.every((t: ResolvedTarget): boolean => t.kind === 'file'),
    ).toBe(true);

    const rules: FileTarget | undefined = byAbsolutePath(
      targets,
      join(PROJECT, 'AGENTS.md'),
    );
    expect(rules?.reportPath).toBe('AGENTS.md');

    expect(
      byAbsolutePath(
        targets,
        join(PROJECT, '.devin', 'agents', 'reviewer', 'AGENT.md'),
      ),
    ).toBeDefined();
    expect(
      byAbsolutePath(
        targets,
        join(PROJECT, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      ),
    ).toBeDefined();
    expect(
      byAbsolutePath(targets, join(PROJECT, '.devin', 'hooks.v1.json')),
    ).toBeDefined();
    expect(
      byAbsolutePath(targets, join(PROJECT, '.devin', 'hooks', 'omd-mode.mjs')),
    ).toBeDefined();
  });

  it('maps rules, roles and skills to user-config file drops at user level', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['rules', 'roles', 'skills'],
    });

    const rules: FileTarget | undefined = byAbsolutePath(
      targets,
      join(USER_CONFIG, 'AGENTS.md'),
    );
    expect(rules?.reportPath).toBe(join(USER_CONFIG, 'AGENTS.md'));
    expect(
      byAbsolutePath(
        targets,
        join(USER_CONFIG, 'agents', 'reviewer', 'AGENT.md'),
      ),
    ).toBeDefined();
    expect(
      byAbsolutePath(
        targets,
        join(USER_CONFIG, 'schemas', 'review.schema.json'),
      ),
    ).toBeDefined();
    expect(
      byAbsolutePath(
        targets,
        join(USER_CONFIG, 'skills', 'omd-delegate', 'SKILL.md'),
      ),
    ).toBeDefined();
  });

  it('resolves user-level hooks to a config-merge target, not file drops', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['hooks'],
    });

    expect(files(targets)).toHaveLength(0);
    const merge: HooksMergeTarget | undefined = targets.find(
      (t: ResolvedTarget): t is HooksMergeTarget => t.kind === 'hooks-merge',
    );
    expect(merge).toBeDefined();
    expect(merge?.scriptAbsolutePath).toBe(
      join(USER_CONFIG, 'hooks', 'omd-mode.mjs'),
    );
    expect(merge?.configAbsolutePath).toBe(join(USER_CONFIG, 'config.json'));
    expect(merge?.hooksMap.SessionStart[0]?.hooks[0]?.command).toContain(
      join(USER_CONFIG, 'hooks', 'omd-mode.mjs'),
    );
  });

  it('shell-quotes the absolute hook script path so a spaced config dir still runs', () => {
    const spaced: string = join('/home', 'John Doe', '.config', 'devin');
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: spaced,
      level: 'user',
      scope: ['hooks'],
    });
    const merge: HooksMergeTarget | undefined = targets.find(
      (t: ResolvedTarget): t is HooksMergeTarget => t.kind === 'hooks-merge',
    );
    const script: string = join(spaced, 'hooks', 'omd-mode.mjs');
    expect(merge?.hooksMap.SessionStart[0]?.hooks[0]?.command).toBe(
      `node '${script}' session-start`,
    );
  });

  it('keeps a hook script path containing shell metacharacters literal', () => {
    const tricky: string = join('/home', 'John $Doe`x`', '.config', 'devin');
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: tricky,
      level: 'user',
      scope: ['hooks'],
    });
    const merge: HooksMergeTarget | undefined = targets.find(
      (t: ResolvedTarget): t is HooksMergeTarget => t.kind === 'hooks-merge',
    );
    const script: string = join(tricky, 'hooks', 'omd-mode.mjs');
    expect(merge?.hooksMap.SessionStart[0]?.hooks[0]?.command).toBe(
      `node '${script}' session-start`,
    );
  });

  it('keeps project-level hooks as file drops even inside a full install', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['hooks'],
    });
    expect(
      targets.some((t: ResolvedTarget): boolean => t.kind === 'hooks-merge'),
    ).toBe(false);
    expect(files(targets).length).toBeGreaterThanOrEqual(2);
  });

  it('installs only the components named in the scope', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['rules'],
    });
    expect(files(targets)).toHaveLength(1);
    expect(files(targets)[0]?.reportPath).toBe('AGENTS.md');
  });

  it('refuses teams at user level by default, since it has no probe-verified location', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['teams'],
    });
    const refused: RefusedTarget | undefined = targets.find(
      (t: ResolvedTarget): t is RefusedTarget => t.kind === 'refused',
    );
    expect(refused?.component).toBe('teams');
    expect(files(targets)).toHaveLength(0);
  });

  it('writes teams as a project-level file drop', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['teams'],
    });
    expect(
      byAbsolutePath(targets, join(PROJECT, '.devin', 'teams', 'default.yaml')),
    ).toBeDefined();
  });

  it('never refuses at project level', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['skills'],
    });
    expect(
      targets.some((t: ResolvedTarget): boolean => t.kind === 'refused'),
    ).toBe(false);
    expect(files(targets).length).toBeGreaterThan(0);
  });
  it('refuses a component named more than once exactly once', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['teams', 'teams'],
    });
    const refusals: readonly RefusedTarget[] = targets.filter(
      (t: ResolvedTarget): t is RefusedTarget => t.kind === 'refused',
    );
    expect(refusals).toHaveLength(1);
    expect(refusals[0]?.component).toBe('teams');
  });

  it('refuses teams and nothing else at user level', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ALL_LAYER_COMPONENTS,
    });
    const refusals: readonly RefusedTarget[] = targets.filter(
      (t: ResolvedTarget): t is RefusedTarget => t.kind === 'refused',
    );
    expect(refusals.map((t: RefusedTarget): string => t.component)).toEqual([
      'teams',
    ]);
  });

  it('never names the plugin channel in a refusal reason', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ALL_LAYER_COMPONENTS,
    });
    for (const target of targets) {
      if (target.kind === 'refused') {
        expect(target.reason.toLowerCase()).not.toContain('plugin');
      }
    }
  });
});
