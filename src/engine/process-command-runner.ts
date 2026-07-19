import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { CommandInvocation } from './command-invocation';
import type { CommandResult } from './command-result';
import type { CommandRunner } from './command-runner';

export class ProcessCommandRunner implements CommandRunner {
  private readonly cwd: string;

  public constructor(cwd: string) {
    this.cwd = cwd;
  }

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    return new Promise<CommandResult>(
      (
        resolve: (result: CommandResult) => void,
        reject: (error: Error) => void,
      ): void => {
        const child: ChildProcessWithoutNullStreams = spawn(
          invocation.command,
          [...invocation.args],
          { cwd: this.cwd },
        );
        let stdout: string = '';
        let stderr: string = '';
        child.stdout.on('data', (chunk: Buffer): void => {
          stdout += chunk.toString();
        });
        child.stderr.on('data', (chunk: Buffer): void => {
          stderr += chunk.toString();
        });
        child.on('error', (error: Error): void => {
          reject(error);
        });
        child.on('close', (code: number | null): void => {
          resolve({ stdout, stderr, exitCode: code ?? 0 });
        });
      },
    );
  }
}
