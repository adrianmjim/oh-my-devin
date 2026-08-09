import { isAbsolute, relative, resolve, sep } from 'node:path';
import { LAYER_ALLOWLIST } from './layer-allowlist';

export function isLayerPath(baseDir: string, filePath: string): boolean {
  const within: string = relative(resolve(baseDir), resolve(baseDir, filePath));
  const head: string = within.split(sep)[0] ?? '';
  return (
    within !== '' &&
    !isAbsolute(within) &&
    head !== '..' &&
    LAYER_ALLOWLIST.includes(head)
  );
}
