import type { PackageManifest } from './package-manifest';

export function toPackageManifest(parsed: unknown): PackageManifest {
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
