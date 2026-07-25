import { join, sep } from 'node:path';
import type { InstallLevel } from './install-level';
import { LAYER_FILES } from './layer-catalog';
import type { LayerComponent } from './layer-component';
import type { LayerFile } from './layer-file';
import type {
  FileTarget,
  HooksMergeTarget,
  RefusedTarget,
  ResolvedTarget,
} from './resolved-target';
import { buildHooksEventMap, HOOK_SCRIPT } from './setup-templates';

export interface ResolveLayerTargetsOptions {
  readonly projectDir: string;
  readonly userConfigDir: string;
  readonly level: InstallLevel;
  readonly scope: readonly LayerComponent[];
}

export const USER_LEVEL_SUPPORTED: readonly LayerComponent[] = [
  'rules',
  'roles',
  'skills',
  'hooks',
];

function toUserRelative(relativePath: string): string {
  const segments: readonly string[] = relativePath.split(sep);
  return segments[0] === '.devin' ? join(...segments.slice(1)) : relativePath;
}

function fileTarget(
  file: LayerFile,
  level: InstallLevel,
  projectDir: string,
  userConfigDir: string,
): FileTarget {
  const base: string = level === 'project' ? projectDir : userConfigDir;
  const relativePath: string =
    level === 'project' ? file.relativePath : toUserRelative(file.relativePath);
  const absolutePath: string = join(base, relativePath);
  const reportPath: string =
    level === 'project' ? file.relativePath : absolutePath;
  return {
    kind: 'file',
    component: file.component,
    absolutePath,
    reportPath,
    content: file.content,
  };
}

function hooksMergeTarget(userConfigDir: string): HooksMergeTarget {
  const scriptAbsolutePath: string = join(
    userConfigDir,
    'hooks',
    'omd-mode.mjs',
  );
  const configAbsolutePath: string = join(userConfigDir, 'config.json');
  return {
    kind: 'hooks-merge',
    component: 'hooks',
    scriptAbsolutePath,
    scriptReportPath: scriptAbsolutePath,
    scriptContent: HOOK_SCRIPT,
    configAbsolutePath,
    configReportPath: configAbsolutePath,
    hooksMap: buildHooksEventMap(`node "${scriptAbsolutePath}"`),
  };
}

function refusal(component: LayerComponent): RefusedTarget {
  const pluginBacked: boolean = component === 'skills' || component === 'rules';
  const reason: string = pluginBacked
    ? 'no verified user-level discovery location; install it through the devin plugin channel instead'
    : 'no verified user-level discovery location';
  return { kind: 'refused', component, reason };
}

export function resolveLayerTargets(
  options: ResolveLayerTargetsOptions,
  userLevelSupported: readonly LayerComponent[] = USER_LEVEL_SUPPORTED,
): readonly ResolvedTarget[] {
  const { projectDir, userConfigDir, level, scope } = options;
  const selected: ReadonlySet<LayerComponent> = new Set(scope);
  const userLevel: boolean = level === 'user';
  const supported: ReadonlySet<LayerComponent> = new Set(userLevelSupported);
  const targets: ResolvedTarget[] = [];

  for (const component of scope) {
    if (userLevel && !supported.has(component)) {
      targets.push(refusal(component));
    }
  }

  if (userLevel && selected.has('hooks') && supported.has('hooks')) {
    targets.push(hooksMergeTarget(userConfigDir));
  }

  for (const file of LAYER_FILES) {
    const componentSelected: boolean = selected.has(file.component);
    const asMerge: boolean = userLevel && file.component === 'hooks';
    const refused: boolean = userLevel && !supported.has(file.component);
    if (componentSelected && !asMerge && !refused) {
      targets.push(fileTarget(file, level, projectDir, userConfigDir));
    }
  }

  return targets;
}
