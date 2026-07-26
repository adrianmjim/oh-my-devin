import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from '../layer/layer-component';

export interface SetupCommand {
  readonly kind: 'setup';
  readonly scope: readonly LayerComponent[] | null;
  readonly level: InstallLevel | null;
}
