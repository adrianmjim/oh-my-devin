import type { ClaimClusters } from './claim-clusters';

export function parseClusters(
  stdout: string,
  count: number,
): ClaimClusters | null {
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
