import type { CommandRunner } from '../engine/command-runner';

export interface DoctorDependencies {
  readonly runner: CommandRunner;
  readonly nodeVersion: string;
}
