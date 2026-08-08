import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from './devin-stub-script';
import type { E2eRunOptions } from './e2e-run-options';

export interface E2eProject {
  readonly dir: string;
  readonly binDir: string;
  readonly logPath: string;
  writeScript(script: DevinStubScript): Promise<void>;
  run(argv: readonly string[], options?: E2eRunOptions): Promise<CommandResult>;
  readInvocations(): Promise<readonly CommandInvocation[]>;
  readHandedBundles(): Promise<readonly AgentConfigBundle[]>;
  cleanup(): Promise<void>;
}
