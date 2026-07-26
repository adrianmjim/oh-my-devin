import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from '../layer/layer-component';

export interface ResolveLayerTargetsOptions {
  readonly projectDir: string;
  readonly userConfigDir: string;
  readonly level: InstallLevel;
  readonly scope: readonly LayerComponent[];
  readonly version: string;
}
