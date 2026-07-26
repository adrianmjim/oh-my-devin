import type { LayerCatalogEntry } from '../layer/layer-catalog-entry';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import type { LayerFile } from './layer-file';

export const LAYER_FILES: readonly LayerFile[] = LAYER_COMPONENT_CATALOG.map(
  (entry: LayerCatalogEntry): LayerFile =>
    entry.userContent === undefined
      ? {
          relativePath: entry.setup.relativePath,
          content: entry.content,
          component: entry.component,
          strategy: entry.setup.strategy,
          regionId: entry.regionId,
        }
      : {
          relativePath: entry.setup.relativePath,
          content: entry.content,
          userContent: entry.userContent,
          component: entry.component,
          strategy: entry.setup.strategy,
          regionId: entry.regionId,
        },
);
