import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { BUNDLE_FILES } from './bundle-files';
import type { PluginBundleResult } from './plugin-bundle-result';

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
