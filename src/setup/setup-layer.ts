import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from './layer-component';
import { ALL_LAYER_COMPONENTS } from './layer-component';
import { resolveLayerTargets } from './resolve-layer-targets';
import type { ResolvedTarget } from './resolved-target';
import type { SetupResult } from './setup-result';
import { writeResolvedTargets } from './write-resolved-targets';

export interface SetupLayerOptions {
  readonly level?: InstallLevel;
  readonly scope?: readonly LayerComponent[];
  readonly userConfigDir?: string;
}

export async function setupLayer(
  projectDir: string,
  options?: SetupLayerOptions,
): Promise<SetupResult> {
  const level: InstallLevel = options?.level ?? 'project';
  const scope: readonly LayerComponent[] =
    options?.scope ?? ALL_LAYER_COMPONENTS;
  const userConfigDir: string = options?.userConfigDir ?? '';
  const targets: readonly ResolvedTarget[] = resolveLayerTargets({
    projectDir,
    userConfigDir,
    level,
    scope,
  });
  return writeResolvedTargets(targets);
}
