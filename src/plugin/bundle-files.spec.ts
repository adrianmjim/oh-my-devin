import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BundleFile } from './bundle-file';
import { BUNDLE_FILES } from './bundle-files';
import { PLUGIN_CARRIED_FILES } from './plugin-carried-files';
import { PLUGIN_MANIFEST } from './plugin-manifest';

describe('BUNDLE_FILES', () => {
  it('leads with the plugin manifest', () => {
    expect(BUNDLE_FILES[0]).toEqual({
      relativePath: join('.devin-plugin', 'plugin.json'),
      content: PLUGIN_MANIFEST,
    });
  });

  it('carries every plugin file after the manifest', () => {
    expect(BUNDLE_FILES).toHaveLength(PLUGIN_CARRIED_FILES.length + 1);
  });

  it('writes each path once', () => {
    const paths: readonly string[] = BUNDLE_FILES.map(
      (file: BundleFile): string => file.relativePath,
    );

    expect(new Set(paths).size).toBe(paths.length);
  });
});
