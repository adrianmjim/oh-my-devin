import type { RunClaim } from './run-claim';

export type RunClaimWriter = (claim: RunClaim) => Promise<void>;
