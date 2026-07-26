import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from '../layer/layer-component';

export interface ElicitSetupOptionsInput {
  readonly input: NodeJS.ReadableStream;
  readonly output: NodeJS.WritableStream;
  readonly interactive: boolean;
  readonly level: InstallLevel | null;
  readonly scope: readonly LayerComponent[] | null;
}
