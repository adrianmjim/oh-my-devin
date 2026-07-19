import { describe, expect, it } from 'vitest';
import type { ArgumentClusterer } from './argument-clusterer';
import type { ClaimClusters } from './claim-clusters';
import type { EchoCluster } from './echo-cluster';
import type { SeatArgument } from './seat-argument';
import { detectEchoes } from './detect-echoes';

function clusterer(clusters: ClaimClusters): ArgumentClusterer {
  return (): Promise<ClaimClusters> => Promise.resolve(clusters);
}

describe('detectEchoes', () => {
  it('collapses clustered arguments into one claim with an endorsement count', async () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
      { seat: 'developer', claim: 'quicker_first_release' },
      { seat: 'pm', claim: 'faster_initial_delivery' },
    ];

    const clusters: readonly EchoCluster[] = await detectEchoes(
      args,
      clusterer([[0, 1, 2]]),
      'round-1',
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.id).toBe('round-1-cluster-0');
    expect(clusters[0]?.claim).toBe('faster_initial_delivery');
    expect(clusters[0]?.endorsements).toBe(3);
    expect(clusters[0]?.seats).toEqual(['architect', 'developer', 'pm']);
  });

  it('keeps substantively distinct arguments in separate clusters', async () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
      { seat: 'sre', claim: 'lower_operational_complexity' },
    ];

    const clusters: readonly EchoCluster[] = await detectEchoes(
      args,
      clusterer([[0], [1]]),
      'round-2',
    );

    expect(clusters).toHaveLength(2);
    expect(clusters.map((c: EchoCluster): number => c.endorsements)).toEqual([
      1, 1,
    ]);
    expect(clusters.map((c: EchoCluster): string => c.id)).toEqual([
      'round-2-cluster-0',
      'round-2-cluster-1',
    ]);
  });

  it('counts distinct seats, not repeated arguments from one seat', async () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
      { seat: 'architect', claim: 'faster_initial_delivery' },
    ];

    const clusters: readonly EchoCluster[] = await detectEchoes(
      args,
      clusterer([[0, 1]]),
      'round-1',
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.endorsements).toBe(1);
  });

  it('hands the clusterer the claims in argument order', async () => {
    const seenClaims: string[][] = [];
    const spy: ArgumentClusterer = (
      claims: readonly string[],
    ): Promise<ClaimClusters> => {
      seenClaims.push([...claims]);
      return Promise.resolve(claims.map((_, index: number) => [index]));
    };

    await detectEchoes(
      [
        { seat: 'a', claim: 'first' },
        { seat: 'b', claim: 'second' },
      ],
      spy,
      'round-1',
    );

    expect(seenClaims).toEqual([['first', 'second']]);
  });

  it('ignores invalid indices and empty groups from a misbehaving clusterer', async () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
    ];

    const clusters: readonly EchoCluster[] = await detectEchoes(
      args,
      clusterer([[0, 7], []]),
      'round-1',
    );

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.seats).toEqual(['architect']);
  });
});
