import type { CommandRunner } from './command-runner';

export type RunnerFactory = (workingDirectory: string) => CommandRunner;
