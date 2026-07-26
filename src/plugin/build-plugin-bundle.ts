import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { LAYER_COMPONENT_CATALOG } from '../layer/layer-component-catalog';
import type { PluginBundleResult } from './plugin-bundle-result';

interface BundleFile {
  readonly relativePath: string;
  readonly content: string;
}

const PLUGIN_MANIFEST: string = `${JSON.stringify({ name: 'oh-my-devin' }, null, 2)}\n`;

const PLUGIN_CARRIED_FILES: BundleFile[] = [];
for (const entry of LAYER_COMPONENT_CATALOG) {
  if (entry.plugin !== undefined) {
    PLUGIN_CARRIED_FILES.push({
      relativePath: entry.plugin.relativePath,
      content: entry.content,
    });
  }
}

const BUNDLE_FILES: readonly BundleFile[] = [
  {
    relativePath: join('.devin-plugin', 'plugin.json'),
    content: PLUGIN_MANIFEST,
  },
  ...PLUGIN_CARRIED_FILES,
];

export async function buildPluginBundle(
  outDir: string,
): Promise<PluginBundleResult> {
  const writtenPaths: string[] = [];
  for (const file of BUNDLE_FILES) {
    const absolutePath: string = join(outDir, file.relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, 'utf8');
    writtenPaths.push(file.relativePath);
  }
  return { writtenPaths };
}
