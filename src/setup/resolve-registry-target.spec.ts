import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RegistryTarget } from './registry-target';
import { resolveRegistryTarget } from './resolve-registry-target';
import type { ResolveLayerTargetsOptions } from './resolve-layer-targets-options';

function options(level: 'project' | 'user'): ResolveLayerTargetsOptions {
  return {
    projectDir: join('/tmp', 'omd-project'),
    userConfigDir: join('/home', 'someone', '.config', 'devin'),
    level,
    scope: ['hooks'],
    version: '1.2.3',
  };
}

describe('resolveRegistryTarget', () => {
  it('targets the project registry document at project level', () => {
    const target: RegistryTarget = resolveRegistryTarget(options('project'));

    expect(target.shape).toBe('document');
    expect(target.reportPath).toBe(join('.devin', 'hooks.v1.json'));
    expect(target.legacyCommands).toEqual([]);
  });

  it('targets the hooks key of the user config at user level', () => {
    const target: RegistryTarget = resolveRegistryTarget(options('user'));

    expect(target.shape).toBe('config-key');
    expect(target.absolutePath).toBe(
      join('/home', 'someone', '.config', 'devin', 'config.json'),
    );
    expect(target.reportPath).toBe(target.absolutePath);
  });

  it('claims the events with the command that runs the installed script', () => {
    const target: RegistryTarget = resolveRegistryTarget(options('project'));

    expect(target.hooksMap.Stop[0]?.hooks[0]?.command).toBe(
      'node .devin/hooks/omd-mode.mjs stop',
    );
  });

  it('carries the legacy user-level commands so earlier installs stay claimable', () => {
    expect(
      resolveRegistryTarget(options('user')).legacyCommands.length,
    ).toBeGreaterThan(0);
  });
});
