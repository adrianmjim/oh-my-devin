import { writeFileAtomically } from '../memory/write-file-atomically';
import type { RunClaim } from './run-claim';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';

export async function writeRunClaim(
  baseDir: string,
  runId: RunId,
  claim: RunClaim,
): Promise<void> {
  await writeFileAtomically(
    new RunRecordPaths(baseDir, runId).claim,
    `${JSON.stringify(claim)}\n`,
  ).catch((): void => undefined);
}
