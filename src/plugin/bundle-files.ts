import { join } from 'node:path';
import type { BundleFile } from './bundle-file';
import { PLUGIN_CARRIED_FILES } from './plugin-carried-files';
import { PLUGIN_MANIFEST } from './plugin-manifest';

export const BUNDLE_FILES: readonly BundleFile[] = [
  {
    relativePath: join('.devin-plugin', 'plugin.json'),
    content: PLUGIN_MANIFEST,
  },
  ...PLUGIN_CARRIED_FILES,
];
