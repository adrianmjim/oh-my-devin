import type { RunId } from '../observability/run-id';
import { writeStreamLine } from './write-stream-line';

export function reportLaunchIdentity(
  command: string,
  runId: RunId,
  json: boolean,
): void {
  writeStreamLine(
    json ? process.stderr : process.stdout,
    `${command} — launched (run ${runId})`,
  );
}
