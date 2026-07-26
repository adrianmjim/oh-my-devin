import { describe, expect, it } from 'vitest';
import type { LayerCatalogEntry } from '../layer/layer-catalog-entry';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import { PLUGIN_CARRIED_FILES } from './plugin-carried-files';

describe('PLUGIN_CARRIED_FILES', () => {
  it('carries every catalog entry declaring a plugin location', () => {
    expect(PLUGIN_CARRIED_FILES).toHaveLength(
      LAYER_COMPONENT_CATALOG.filter(
        (entry: LayerCatalogEntry): boolean => entry.plugin !== undefined,
      ).length,
    );
  });

  it('carries the content of each entry at its plugin path', () => {
    for (const file of PLUGIN_CARRIED_FILES) {
      expect(file.relativePath.length).toBeGreaterThan(0);
      expect(file.content.length).toBeGreaterThan(0);
    }
  });

  it('never carries a setup-only path', () => {
    for (const file of PLUGIN_CARRIED_FILES) {
      expect(file.relativePath.startsWith('.devin/')).toBe(false);
    }
  });
});
