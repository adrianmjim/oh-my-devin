import type { InstallLevel } from '../layer/install-level';
import { isInstallLevel } from '../layer/is-install-level';
import { LEVEL_HINT } from './level-hint';
import { LEVEL_PROMPT } from './level-prompt';
import type { LineReader } from './line-reader';

export async function promptLevel(
  reader: LineReader,
  output: NodeJS.WritableStream,
): Promise<InstallLevel> {
  let resolved: InstallLevel | null = null;
  while (resolved === null) {
    const answer: string | null = await reader.next(LEVEL_PROMPT);
    const normalized: string = (answer ?? '').trim().toLowerCase();
    if (answer === null) {
      output.write('\n');
      resolved = 'project';
    } else if (normalized === '') {
      resolved = 'project';
    } else if (isInstallLevel(normalized)) {
      resolved = normalized;
    } else {
      output.write(LEVEL_HINT);
    }
  }
  return resolved;
}
