import type { Clock } from '../budget/clock';
import type { RunnerFactory } from '../engine/runner-factory';
import type { LayerLookup } from '../layer/layer-lookup';
import type { WorktreeProvisioner } from '../worktree/worktree-provisioner';
import type { ArtifactReader } from './artifact-reader';
import type { RoleRunner } from './role-runner';

export interface StageRunnerDeps {
  readonly worktrees: WorktreeProvisioner;
  readonly runRole: RoleRunner;
  readonly runnerFor: RunnerFactory;
  readonly readArtifact: ArtifactReader;
  readonly clock: Clock;
  readonly userConfigDir: LayerLookup['userConfigDir'];
}
