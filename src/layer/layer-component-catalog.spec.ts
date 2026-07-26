import { describe, expect, it } from 'vitest';
import type { LayerCatalogEntry } from './layer-catalog-entry';
import { LAYER_COMPONENT_CATALOG } from './layer-component-catalog';

describe('LAYER_COMPONENT_CATALOG', () => {
  it('gives every entry a region identity of its own', () => {
    const ids: readonly string[] = LAYER_COMPONENT_CATALOG.map(
      (entry: LayerCatalogEntry): string => entry.regionId,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every entry a distinct setup path', () => {
    const paths: readonly string[] = LAYER_COMPONENT_CATALOG.map(
      (entry: LayerCatalogEntry): string => entry.setup.relativePath,
    );

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every plugin-carried entry a distinct plugin path', () => {
    const paths: string[] = [];
    for (const entry of LAYER_COMPONENT_CATALOG) {
      if (entry.plugin !== undefined) {
        paths.push(entry.plugin.relativePath);
      }
    }

    expect(paths.length).toBeGreaterThan(0);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('carries into the plugin exactly the rules file and the skills', () => {
    for (const entry of LAYER_COMPONENT_CATALOG) {
      const carried: boolean = entry.plugin !== undefined;
      const eligible: boolean =
        entry.component === 'rules' || entry.component === 'skills';

      expect(carried, entry.regionId).toBe(eligible);
    }
  });
});
