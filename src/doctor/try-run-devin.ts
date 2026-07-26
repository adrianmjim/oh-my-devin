import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';

export async function tryRunDevin(
  runner: CommandRunner,
  args: readonly string[],
): Promise<CommandResult | null> {
  try {
    return await runner.run({ command: 'devin', args: [...args] });
  } catch {
    return null;
  }
}
