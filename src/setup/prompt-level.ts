import type { InstallLevel } from '../layer/install-level';
import { isInstallLevel } from '../layer/install-level';
import type { LineReader } from './line-reader';

const LEVEL_PROMPT: string =
  'Install level? [project/user] (default: project) ';
const LEVEL_HINT: string = 'Please answer "project" or "user".\n';

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
