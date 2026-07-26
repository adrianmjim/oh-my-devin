import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from '../layer/layer-component';

export interface SetupLayerOptions {
  readonly level?: InstallLevel;
  readonly scope?: readonly LayerComponent[];
  readonly userConfigDir?: string;
  readonly version?: string;
}
