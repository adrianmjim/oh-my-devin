import type { LayerComponent } from '../layer/layer-component';
import { LAYER_FILES } from './layer-files';
import type { ResolvedTarget } from './resolved-target';
import type { ResolveLayerTargetsOptions } from './resolve-layer-targets-options';
import { resolveMergeTarget } from './resolve-merge-target';
import { resolveRefusedTarget } from './resolve-refused-target';
import { resolveRegistryTarget } from './resolve-registry-target';
import { USER_LEVEL_SUPPORTED } from './user-level-supported';

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
      targets.push(resolveRefusedTarget(component));
    }
  }

  for (const file of LAYER_FILES) {
    const refused: boolean = userLevel && !supported.has(file.component);
    if (selected.has(file.component) && !refused) {
      targets.push(resolveMergeTarget(file, options));
    }
  }

  const hooksInstallable: boolean =
    selected.has('hooks') && (!userLevel || supported.has('hooks'));
  if (hooksInstallable) {
    targets.push(resolveRegistryTarget(options));
  }

  return targets;
}
