import { readFile } from 'node:fs/promises';
import { MANIFEST_PATH } from './manifest-path';
import type { PackageManifest } from './package-manifest';
import { toPackageManifest } from './to-package-manifest';

export async function reportVersion(): Promise<string> {
  const raw: string = await readFile(MANIFEST_PATH, 'utf8');
  const manifest: PackageManifest = toPackageManifest(JSON.parse(raw));
  return manifest.version;
}
