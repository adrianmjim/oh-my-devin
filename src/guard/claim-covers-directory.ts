import { isAbsolute, relative, sep } from 'node:path';
import type { RunClaim } from '../observability/run-claim';
import { realDirectory } from './real-directory';

export async function claimCoversDirectory(
  claim: RunClaim,
  cwd: string,
): Promise<boolean> {
  const within: string = relative(
    await realDirectory(claim.workingDirectory),
    await realDirectory(cwd),
  );
  return (
    claim.worktreeProvisioned &&
    !isAbsolute(within) &&
    within !== '..' &&
    !within.startsWith(`..${sep}`)
  );
}
