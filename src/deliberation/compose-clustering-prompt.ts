export function composeClusteringPrompt(claims: readonly string[]): string {
  const listed: string = claims
    .map((claim: string, index: number): string => `${index}. ${claim}`)
    .join('\n');
  return [
    'Cluster the following deliberation arguments. Two arguments belong to the same cluster only when they are near-identical: the same recommended action supported by the same primary justification.',
    listed,
    'Reply with only a JSON array of arrays of zero-based argument indices, one inner array per cluster, covering every index exactly once.',
  ].join('\n\n');
}
