import type { ArgumentClusterer } from './argument-clusterer';
import type { ClaimClusters } from './claim-clusters';
import type { EchoCluster } from './echo-cluster';
import type { SeatArgument } from './seat-argument';

export async function detectEchoes(
  args: readonly SeatArgument[],
  clusterArguments: ArgumentClusterer,
  idPrefix: string,
): Promise<readonly EchoCluster[]> {
  const groups: ClaimClusters = await clusterArguments(
    args.map((argument: SeatArgument): string => argument.claim),
  );

  const clusters: EchoCluster[] = [];
  for (const group of groups) {
    const members: readonly SeatArgument[] = group
      .filter((index: number): boolean => index >= 0 && index < args.length)
      .map((index: number): SeatArgument => requireArgument(args[index]));
    if (members.length > 0) {
      const seats: string[] = [];
      for (const member of members) {
        if (!seats.includes(member.seat)) {
          seats.push(member.seat);
        }
      }
      clusters.push({
        id: `${idPrefix}-cluster-${clusters.length}`,
        claim: requireArgument(members[0]).claim,
        endorsements: seats.length,
        seats,
      });
    }
  }
  return clusters;
}

function requireArgument(argument: SeatArgument | undefined): SeatArgument {
  if (argument === undefined) {
    throw new Error('echo cluster member vanished');
  }
  return argument;
}
