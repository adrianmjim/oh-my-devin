import type { LayerComponent } from './layer-component';
import type { PluginPlacement } from './plugin-placement';
import type { SetupPlacement } from './setup-placement';

export interface LayerCatalogEntry {
  readonly regionId: string;
  readonly component: LayerComponent;
  readonly content: string;
  readonly userContent?: string;
  readonly setup: SetupPlacement;
  readonly plugin?: PluginPlacement;
}
