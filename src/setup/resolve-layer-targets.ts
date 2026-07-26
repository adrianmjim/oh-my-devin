import { join } from 'node:path';
import type { InstallLevel } from '../layer/install-level';
import { layerFilePath } from '../layer/layer-file-path';
import { commentStyleForPath } from '../ownership/comment-style-for-path';
import { LAYER_FILES } from './layer-catalog';
import type { LayerComponent } from './layer-component';
import type { LayerFile } from './layer-file';
import { posixQuote } from './posix-quote';
import type {
  MergeTarget,
  RefusedTarget,
  RegistryTarget,
  ResolvedTarget,
} from './resolved-target';
import {
  buildHooksEventMap,
  HOOK_SCRIPT_FILENAME,
  PROJECT_HOOK_COMMAND,
} from './setup-templates';

export interface ResolveLayerTargetsOptions {
  readonly projectDir: string;
  readonly userConfigDir: string;
  readonly level: InstallLevel;
  readonly scope: readonly LayerComponent[];
  readonly version: string;
}

export const USER_LEVEL_SUPPORTED: readonly LayerComponent[] = [
  'rules',
  'roles',
  'skills',
  'hooks',
];

const PROJECT_REGISTRY_PATH: string = join('.devin', 'hooks.v1.json');

function mergeTarget(
  file: LayerFile,
  options: ResolveLayerTargetsOptions,
): MergeTarget {
  const userLevel: boolean = options.level === 'user';
  const base: string = userLevel ? options.userConfigDir : options.projectDir;
  const absolutePath: string = layerFilePath(
    options.level,
    base,
    file.relativePath,
  );
  const content: string =
    userLevel && file.userContent !== undefined
      ? file.userContent
      : file.content;
  return {
    kind: 'merge',
    component: file.component,
    absolutePath,
    reportPath: userLevel ? absolutePath : file.relativePath,
    strategy: file.strategy,
    framing: {
      id: file.regionId,
      version: options.version,
      style: commentStyleForPath(file.relativePath),
      content,
    },
  };
}

function registryTarget(options: ResolveLayerTargetsOptions): RegistryTarget {
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
  };
}

function refusal(component: LayerComponent): RefusedTarget {
  return {
    kind: 'refused',
    component,
    reason: 'no verified user-level discovery location',
  };
}

export function resolveLayerTargets(
  options: ResolveLayerTargetsOptions,
): readonly ResolvedTarget[] {
  const { level, scope } = options;
  const selected: ReadonlySet<LayerComponent> = new Set(scope);
  const userLevel: boolean = level === 'user';
  const supported: ReadonlySet<LayerComponent> = new Set(USER_LEVEL_SUPPORTED);
  const targets: ResolvedTarget[] = [];

  for (const component of selected) {
    if (userLevel && !supported.has(component)) {
      targets.push(refusal(component));
    }
  }

  for (const file of LAYER_FILES) {
    const refused: boolean = userLevel && !supported.has(file.component);
    if (selected.has(file.component) && !refused) {
      targets.push(mergeTarget(file, options));
    }
  }

  const hooksInstallable: boolean =
    selected.has('hooks') && (!userLevel || supported.has('hooks'));
  if (hooksInstallable) {
    targets.push(registryTarget(options));
  }

  return targets;
}
