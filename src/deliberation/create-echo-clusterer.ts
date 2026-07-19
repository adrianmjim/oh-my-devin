import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { ArgumentClusterer } from './argument-clusterer';
import type { ClaimClusters } from './claim-clusters';

export function createEchoClusterer(runner: CommandRunner): ArgumentClusterer {
  return async (claims: readonly string[]): Promise<ClaimClusters> => {
    let result: CommandResult;
    try {
      result = await runner.run({
        command: 'devin',
        args: ['-p', composeClusteringPrompt(claims)],
      });
    } catch {
      return identityClusters(claims);
    }
    if (result.exitCode !== 0) {
      return identityClusters(claims);
    }
    return (
      parseClusters(result.stdout, claims.length) ?? identityClusters(claims)
    );
  };
}

function composeClusteringPrompt(claims: readonly string[]): string {
  const listed: string = claims
    .map((claim: string, index: number): string => `${index}. ${claim}`)
    .join('\n');
  return [
    'Cluster the following deliberation arguments. Two arguments belong to the same cluster only when they are near-identical: the same recommended action supported by the same primary justification.',
    listed,
    'Reply with only a JSON array of arrays of zero-based argument indices, one inner array per cluster, covering every index exactly once.',
  ].join('\n\n');
}

function identityClusters(claims: readonly string[]): ClaimClusters {
  return claims.map((_claim: string, index: number): readonly number[] => [
    index,
  ]);
}

function parseClusters(stdout: string, count: number): ClaimClusters | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout.trim());
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) {
    return null;
  }
  const seen: Set<number> = new Set<number>();
  const clusters: (readonly number[])[] = [];
  for (const group of parsed as readonly unknown[]) {
    if (!Array.isArray(group) || group.length === 0) {
      return null;
    }
    const indices: number[] = [];
    for (const index of group as readonly unknown[]) {
      if (
        typeof index !== 'number' ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= count ||
        seen.has(index)
      ) {
        return null;
      }
      seen.add(index);
      indices.push(index);
    }
    clusters.push(indices);
  }
  if (seen.size !== count) {
    return null;
  }
  return clusters;
}
