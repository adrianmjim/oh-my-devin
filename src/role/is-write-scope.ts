import type { WriteScope } from './write-scope';

export function isWriteScope(value: unknown): value is WriteScope {
  return value === 'artifact' || value === 'worktree';
}
