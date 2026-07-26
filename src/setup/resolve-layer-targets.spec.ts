import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from '../layer/all-layer-components';
import type { MergeTarget } from './merge-target';
import type { RefusedTarget } from './refused-target';
import type { RegistryTarget } from './registry-target';
import type { ResolvedTarget } from './resolved-target';
import { resolveLayerTargets } from './resolve-layer-targets';

const PROJECT: string = join('/tmp', 'omd-project');
const USER_CONFIG: string = join('/home', 'someone', '.config', 'devin');
const VERSION: string = '1.2.3';

function merges(targets: readonly ResolvedTarget[]): readonly MergeTarget[] {
  return targets.filter(
    (t: ResolvedTarget): t is MergeTarget => t.kind === 'merge',
  );
}

function registry(
  targets: readonly ResolvedTarget[],
): RegistryTarget | undefined {
  return targets.find(
    (t: ResolvedTarget): t is RegistryTarget => t.kind === 'registry',
  );
}

function byAbsolutePath(
  targets: readonly ResolvedTarget[],
  absolutePath: string,
): MergeTarget | undefined {
  return merges(targets).find(
    (t: MergeTarget): boolean => t.absolutePath === absolutePath,
  );
}

describe('resolveLayerTargets', () => {
  it('reproduces today’s project-relative file locations at project level', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ALL_LAYER_COMPONENTS,
      version: VERSION,
    });

    const rules: MergeTarget | undefined = byAbsolutePath(
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
      byAbsolutePath(targets, join(PROJECT, '.devin', 'hooks', 'omd-mode.mjs')),
    ).toBeDefined();
  });

  it('carries the merge strategy, the region identity and the layer version onto every target', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ALL_LAYER_COMPONENTS,
      version: VERSION,
    });

    for (const target of merges(targets)) {
      expect(target.strategy.length).toBeGreaterThan(0);
      expect(target.framing.id.length).toBeGreaterThan(0);
      expect(target.framing.version).toBe(VERSION);
    }
  });

  it('frames each target in the comment syntax of its format', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ALL_LAYER_COMPONENTS,
      version: VERSION,
    });

    expect(
      byAbsolutePath(targets, join(PROJECT, 'AGENTS.md'))?.framing.style,
    ).toBe('markdown');
    expect(
      byAbsolutePath(targets, join(PROJECT, '.devin', 'teams', 'default.yaml'))
        ?.framing.style,
    ).toBe('yaml');
    expect(
      byAbsolutePath(targets, join(PROJECT, '.devin', 'hooks', 'omd-mode.mjs'))
        ?.framing.style,
    ).toBe('script');
  });

  it('resolves the project hook registry as a claim over its document', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['hooks'],
      version: VERSION,
    });

    const claim: RegistryTarget | undefined = registry(targets);
    expect(claim?.shape).toBe('document');
    expect(claim?.absolutePath).toBe(join(PROJECT, '.devin', 'hooks.v1.json'));
    expect(claim?.reportPath).toBe(join('.devin', 'hooks.v1.json'));
    expect(claim?.hooksMap.SessionStart[0]?.hooks[0]?.command).toBe(
      'node .devin/hooks/omd-mode.mjs session-start',
    );
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
      version: VERSION,
    });

    const rules: MergeTarget | undefined = byAbsolutePath(
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

  it('installs rules content that does not describe itself as project-scoped at user level', () => {
    const userTargets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['rules'],
      version: VERSION,
    });
    const projectTargets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['rules'],
      version: VERSION,
    });

    expect(
      byAbsolutePath(projectTargets, join(PROJECT, 'AGENTS.md'))?.framing
        .content,
    ).toMatch(/this project/i);
    expect(
      byAbsolutePath(userTargets, join(USER_CONFIG, 'AGENTS.md'))?.framing
        .content,
    ).not.toMatch(/this project/i);
  });

  it('resolves the user-level hook registry as a claim over the configuration key', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['hooks'],
      version: VERSION,
    });

    const claim: RegistryTarget | undefined = registry(targets);
    expect(claim?.shape).toBe('config-key');
    expect(claim?.absolutePath).toBe(join(USER_CONFIG, 'config.json'));
    expect(claim?.hooksMap.SessionStart[0]?.hooks[0]?.command).toContain(
      join(USER_CONFIG, 'hooks', 'omd-mode.mjs'),
    );
    expect(
      byAbsolutePath(targets, join(USER_CONFIG, 'hooks', 'omd-mode.mjs')),
    ).toBeDefined();
  });

  it('shell-quotes the absolute hook script path so a spaced config dir still runs', () => {
    const spaced: string = join('/home', 'John Doe', '.config', 'devin');
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: spaced,
      level: 'user',
      scope: ['hooks'],
      version: VERSION,
    });

    const script: string = join(spaced, 'hooks', 'omd-mode.mjs');
    expect(registry(targets)?.hooksMap.SessionStart[0]?.hooks[0]?.command).toBe(
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
      version: VERSION,
    });

    const script: string = join(tricky, 'hooks', 'omd-mode.mjs');
    expect(registry(targets)?.hooksMap.SessionStart[0]?.hooks[0]?.command).toBe(
      `node '${script}' session-start`,
    );
  });

  it('binds the registry claim to the hook script it registers', () => {
    const project: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['hooks'],
      version: VERSION,
    });
    const user: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['hooks'],
      version: VERSION,
    });

    expect(registry(project)?.scriptPath).toBe(
      join(PROJECT, '.devin', 'hooks', 'omd-mode.mjs'),
    );
    expect(registry(user)?.scriptPath).toBe(
      join(USER_CONFIG, 'hooks', 'omd-mode.mjs'),
    );
  });

  it('carries the legacy command forms a previous user-level install wrote', () => {
    const project: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['hooks'],
      version: VERSION,
    });
    const user: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['hooks'],
      version: VERSION,
    });

    const script: string = join(USER_CONFIG, 'hooks', 'omd-mode.mjs');
    expect(registry(user)?.legacyCommands).toEqual([
      `node "${script}" session-start`,
      `node "${script}" user-prompt`,
      `node "${script}" stop`,
    ]);
    expect(registry(project)?.legacyCommands).toEqual([]);
  });

  it('resolves the hook script before the registry that invokes it', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ALL_LAYER_COMPONENTS,
      version: VERSION,
    });

    const scriptIndex: number = targets.findIndex(
      (t: ResolvedTarget): boolean =>
        t.kind === 'merge' &&
        t.absolutePath === join(PROJECT, '.devin', 'hooks', 'omd-mode.mjs'),
    );
    const registryIndex: number = targets.findIndex(
      (t: ResolvedTarget): boolean => t.kind === 'registry',
    );
    expect(scriptIndex).toBeGreaterThanOrEqual(0);
    expect(registryIndex).toBeGreaterThan(scriptIndex);
  });

  it('installs only the components named in the scope', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['rules'],
      version: VERSION,
    });

    expect(merges(targets)).toHaveLength(1);
    expect(merges(targets)[0]?.reportPath).toBe('AGENTS.md');
  });

  it('refuses teams at user level by default, since it has no probe-verified location', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['teams'],
      version: VERSION,
    });

    const refused: RefusedTarget | undefined = targets.find(
      (t: ResolvedTarget): t is RefusedTarget => t.kind === 'refused',
    );
    expect(refused?.component).toBe('teams');
    expect(merges(targets)).toHaveLength(0);
  });

  it('writes teams as a project-level file drop', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'project',
      scope: ['teams'],
      version: VERSION,
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
      version: VERSION,
    });

    expect(
      targets.some((t: ResolvedTarget): boolean => t.kind === 'refused'),
    ).toBe(false);
    expect(merges(targets).length).toBeGreaterThan(0);
  });

  it('refuses a component named more than once exactly once', () => {
    const targets: readonly ResolvedTarget[] = resolveLayerTargets({
      projectDir: PROJECT,
      userConfigDir: USER_CONFIG,
      level: 'user',
      scope: ['teams', 'teams'],
      version: VERSION,
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
      version: VERSION,
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
      version: VERSION,
    });

    for (const target of targets) {
      if (target.kind === 'refused') {
        expect(target.reason.toLowerCase()).not.toContain('plugin');
      }
    }
  });
});
