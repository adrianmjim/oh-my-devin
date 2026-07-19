import type { ClaimClusters } from './claim-clusters';

export type ArgumentClusterer = (
  claims: readonly string[],
) => Promise<ClaimClusters>;
