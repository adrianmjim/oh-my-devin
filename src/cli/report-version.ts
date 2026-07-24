import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackageManifest } from './package-manifest';
import { toPackageManifest } from './to-package-manifest';

const MANIFEST_PATH: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'package.json',
);

export async function reportVersion(): Promise<string> {
  const raw: string = await readFile(MANIFEST_PATH, 'utf8');
  const manifest: PackageManifest = toPackageManifest(JSON.parse(raw));
  return manifest.version;
}
