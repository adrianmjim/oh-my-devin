import type { Clock } from '../budget/clock';
import type { CommandRunner } from '../engine/command-runner';
import type { BenchFixture } from './bench-fixture';
import type { BenchRunMode } from './bench-run-mode';
import type { RoleRunSurface } from './role-run-surface';
import type { ScratchProject } from './scratch-project';

export interface RunFixtureOptions {
  readonly fixture: BenchFixture;
  readonly mode: BenchRunMode;
  readonly model: string;
  readonly scratch: ScratchProject;
  readonly run: RoleRunSurface;
  readonly runner: CommandRunner;
  readonly clock: Clock;
}
