import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface PackageManifest {
  readonly version: string;
}

const MANIFEST_PATH: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'package.json',
);

function toManifest(parsed: unknown): PackageManifest {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('package manifest must be a JSON object');
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;
  const version: unknown = fields['version'];
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error('package manifest is missing a string "version"');
  }
  return { version };
}

export async function reportVersion(): Promise<string> {
  const raw: string = await readFile(MANIFEST_PATH, 'utf8');
  return toManifest(JSON.parse(raw)).version;
}
