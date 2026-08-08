import { MEMORY_SUBTREE_SEGMENTS } from './memory-subtree-segments';

export function isUnderMemorySubtree(repoRelativePath: string): boolean {
  const segments: readonly string[] = repoRelativePath
    .split(/[\\/]/)
    .filter((segment: string): boolean => segment !== '' && segment !== '.');
  return MEMORY_SUBTREE_SEGMENTS.every(
    (expected: string, index: number): boolean => segments[index] === expected,
  );
}
