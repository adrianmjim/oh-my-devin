import { isAbsolute } from 'node:path';

export function isRepoRelativePath(value: string): boolean {
  return !isAbsolute(value) && !value.split('/').includes('..');
}
