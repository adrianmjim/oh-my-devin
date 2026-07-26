import type { ClaimClusters } from './claim-clusters';

export function identityClusters(claims: readonly string[]): ClaimClusters {
  return claims.map((_claim: string, index: number): readonly number[] => [
    index,
  ]);
}
