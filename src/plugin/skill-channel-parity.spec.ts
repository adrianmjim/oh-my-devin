import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import type { PluginPlacement } from '../layer/plugin-placement';
import { normalizeForDigest } from '../ownership/normalize-for-digest';
import type { RegionScan } from '../ownership/region-scan';
import { scanRegion } from '../ownership/scan-region';
import { setupLayer } from '../setup/setup-layer';
import { buildPluginBundle } from './build-plugin-bundle';

async function installedContent(path: string, id: string): Promise<string> {
  const scan: RegionScan = scanRegion(
    await readFile(path, 'utf8'),
    id,
    'markdown',
  );
  if (scan.kind !== 'located') {
    throw new Error(`${path} carries no omd region named ${id}`);
  }
  return normalizeForDigest(`${scan.before}${scan.body}`);
}

describe('skill and rules channel parity', () => {
  let setupDir: string;
  let pluginDir: string;

  beforeEach(async () => {
    setupDir = await mkdtemp(join(tmpdir(), 'omd-setup-'));
    pluginDir = await mkdtemp(join(tmpdir(), 'omd-plugin-'));
    await setupLayer(setupDir);
    await buildPluginBundle(pluginDir);
  });

  afterEach(async () => {
    await rm(setupDir, { recursive: true, force: true });
    await rm(pluginDir, { recursive: true, force: true });
  });

  it('emits byte-identical content through both channels for every plugin-carried component', async () => {
    let carried: number = 0;
    for (const entry of LAYER_COMPONENT_CATALOG) {
      const plugin: PluginPlacement | undefined = entry.plugin;
      if (plugin !== undefined) {
        carried += 1;
        const fromSetup: string = await installedContent(
          join(setupDir, entry.setup.relativePath),
          entry.regionId,
        );
        const fromPlugin: string = normalizeForDigest(
          await readFile(join(pluginDir, plugin.relativePath), 'utf8'),
        );

        expect(fromPlugin, entry.regionId).toBe(fromSetup);
      }
    }

    expect(carried).toBeGreaterThan(0);
  });
});
