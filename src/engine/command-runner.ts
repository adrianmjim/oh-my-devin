import type { CommandInvocation } from './command-invocation';
import type { CommandResult } from './command-result';

export interface CommandRunner {
  run(invocation: CommandInvocation): Promise<CommandResult>;
}
