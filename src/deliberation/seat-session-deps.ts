import type { Clock } from '../budget/clock';
import type { RunnerFactory } from '../engine/runner-factory';
import type { ArtifactReader } from '../pipeline/artifact-reader';
import type { RoleRunner } from '../pipeline/role-runner';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';

export interface SeatSessionDeps {
  readonly worktrees: WorktreeProvisioner;
  readonly runRole: RoleRunner;
  readonly runnerFor: RunnerFactory;
  readonly readArtifact: ArtifactReader;
  readonly clock: Clock;
}
