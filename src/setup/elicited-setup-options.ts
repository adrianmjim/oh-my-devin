import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from '../layer/layer-component';

export interface ElicitedSetupOptions {
  readonly level: InstallLevel;
  readonly scope: readonly LayerComponent[] | null;
}
