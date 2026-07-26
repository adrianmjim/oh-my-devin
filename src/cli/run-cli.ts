import { homedir } from 'node:os';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { resolveUserConfigDir } from '../layer/resolve-user-config-dir';
import type { CliCommand } from './cli-command';
import { dispatchCliCommand } from './dispatch-cli-command';
import { parseCliArgs } from './parse-cli-args';

export async function runCli(): Promise<number> {
  const command: CliCommand = parseCliArgs(process.argv.slice(2));
  const cwd: string = process.cwd();
  const userConfigDir: string = resolveUserConfigDir(
    process.env['XDG_CONFIG_HOME'],
    homedir(),
  );
  const runner: ProcessCommandRunner = new ProcessCommandRunner(cwd);
  return dispatchCliCommand(command, cwd, userConfigDir, runner);
}
