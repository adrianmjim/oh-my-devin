import { isAbsolute, relative, resolve, sep } from 'node:path';
import type { RunClaim } from '../observability/run-claim';

export function claimCoversDirectory(claim: RunClaim, cwd: string): boolean {
  const within: string = relative(
    resolve(claim.workingDirectory),
    resolve(cwd),
  );
  return (
    claim.worktreeProvisioned &&
    !isAbsolute(within) &&
    within !== '..' &&
    !within.startsWith(`..${sep}`)
  );
}
