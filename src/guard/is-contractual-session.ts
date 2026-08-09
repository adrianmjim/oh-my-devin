import type { SessionId } from '../modes/session-id';
import { enumerateRunRecords } from '../observability/enumerate-run-records';
import { LIVENESS_STALL_THRESHOLD_MS } from '../observability/liveness-stall-threshold-ms';
import { readRunClaim } from '../observability/read-run-claim';
import type { RunClaim } from '../observability/run-claim';
import type { RunId } from '../observability/run-id';
import { claimCoversDirectory } from './claim-covers-directory';

export async function isContractualSession(
  baseDir: string,
  sessionId: SessionId | null,
  cwd: string,
  now: number,
): Promise<boolean> {
  const live: readonly RunId[] = await enumerateRunRecords(
    baseDir,
    now,
    LIVENESS_STALL_THRESHOLD_MS,
  );
  let contractual: boolean = false;
  for (const runId of live) {
    const claim: RunClaim | null = await readRunClaim(baseDir, runId);
    if (
      claim !== null &&
      (claimCoversDirectory(claim, cwd) ||
        (sessionId !== null && claim.sessionId === sessionId))
    ) {
      contractual = true;
    }
  }
  return contractual;
}
