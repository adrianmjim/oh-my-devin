import { join } from 'node:path';
import { buildHooksEventMap } from './build-hooks-event-map';
import { HOOK_SCRIPT_FILENAME } from './hook-script-filename';
import { legacyHookCommands } from './legacy-hook-commands';
import { posixQuote } from './posix-quote';
import { PROJECT_HOOK_COMMAND } from './project-hook-command';
import { PROJECT_REGISTRY_PATH } from './project-registry-path';
import type { RegistryTarget } from './registry-target';
import type { ResolveLayerTargetsOptions } from './resolve-layer-targets-options';

export function resolveRegistryTarget(
  options: ResolveLayerTargetsOptions,
): RegistryTarget {
  const userLevel: boolean = options.level === 'user';
  const scriptPath: string = userLevel
    ? join(options.userConfigDir, 'hooks', HOOK_SCRIPT_FILENAME)
    : join(options.projectDir, '.devin', 'hooks', HOOK_SCRIPT_FILENAME);
  const absolutePath: string = userLevel
    ? join(options.userConfigDir, 'config.json')
    : join(options.projectDir, PROJECT_REGISTRY_PATH);
  return {
    kind: 'registry',
    component: 'hooks',
    absolutePath,
    reportPath: userLevel ? absolutePath : PROJECT_REGISTRY_PATH,
    shape: userLevel ? 'config-key' : 'document',
    scriptPath,
    hooksMap: buildHooksEventMap(
      userLevel ? `node ${posixQuote(scriptPath)}` : PROJECT_HOOK_COMMAND,
    ),
    legacyCommands: userLevel ? legacyHookCommands(scriptPath) : [],
  };
}
