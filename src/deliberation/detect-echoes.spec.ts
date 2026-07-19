import { describe, expect, it } from 'vitest';
import type { ClaimKeyOf } from './claim-key-of';
import type { EchoCluster } from './echo-cluster';
import type { SeatArgument } from './seat-argument';
import { detectEchoes } from './detect-echoes';

const byClaimText: ClaimKeyOf = (argument: SeatArgument): string =>
  argument.claim;

describe('detectEchoes', () => {
  it('collapses near-identical arguments into one with an endorsement count', () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
      { seat: 'developer', claim: 'faster_initial_delivery' },
      { seat: 'pm', claim: 'faster_initial_delivery' },
    ];

    const clusters: readonly EchoCluster[] = detectEchoes(args, byClaimText);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.endorsements).toBe(3);
    expect(clusters[0]?.seats).toEqual(['architect', 'developer', 'pm']);
  });

  it('keeps substantively distinct arguments separate', () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
      { seat: 'sre', claim: 'lower_operational_complexity' },
    ];

    const clusters: readonly EchoCluster[] = detectEchoes(args, byClaimText);

    expect(clusters).toHaveLength(2);
    expect(clusters.map((c) => c.endorsements)).toEqual([1, 1]);
  });

  it('counts distinct seats, not repeated arguments from one seat', () => {
    const args: readonly SeatArgument[] = [
      { seat: 'architect', claim: 'faster_initial_delivery' },
      { seat: 'architect', claim: 'faster_initial_delivery' },
    ];

    const clusters: readonly EchoCluster[] = detectEchoes(args, byClaimText);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.endorsements).toBe(1);
  });
});
