import type { LayerCatalogEntry } from '../layer/layer-catalog-entry';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import type { BundleFile } from './bundle-file';

export const PLUGIN_CARRIED_FILES: readonly BundleFile[] =
  LAYER_COMPONENT_CATALOG.filter(
    (entry: LayerCatalogEntry): boolean => entry.plugin !== undefined,
  ).map((entry: LayerCatalogEntry): BundleFile => ({
    relativePath: entry.plugin?.relativePath ?? '',
    content: entry.content,
  }));
