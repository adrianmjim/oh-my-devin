import type { Worktree } from './worktree';

export interface WorktreeProvisioner {
  create(instanceId: string): Promise<Worktree>;
  captureDiff(worktree: Worktree, excludedArtifact: string): Promise<string>;
  remove(worktree: Worktree): Promise<void>;
}
