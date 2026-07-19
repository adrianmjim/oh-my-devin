import type { ClaimKeyOf } from './claim-key-of';
import type { EchoCluster } from './echo-cluster';
import type { SeatArgument } from './seat-argument';

interface ClusterAccumulator {
  readonly claim: string;
  readonly seats: string[];
}

export function detectEchoes(
  args: readonly SeatArgument[],
  claimKeyOf: ClaimKeyOf,
): readonly EchoCluster[] {
  const byKey: Map<string, ClusterAccumulator> = new Map<
    string,
    ClusterAccumulator
  >();
  const order: string[] = [];

  for (const argument of args) {
    const key: string = claimKeyOf(argument);
    const existing: ClusterAccumulator | undefined = byKey.get(key);
    if (existing === undefined) {
      byKey.set(key, { claim: argument.claim, seats: [argument.seat] });
      order.push(key);
      continue;
    }
    if (!existing.seats.includes(argument.seat)) {
      existing.seats.push(argument.seat);
    }
  }

  return order.map((key: string): EchoCluster => {
    const accumulator: ClusterAccumulator = required(byKey.get(key));
    return {
      id: key,
      claim: accumulator.claim,
      endorsements: accumulator.seats.length,
      seats: accumulator.seats,
    };
  });
}

function required(
  accumulator: ClusterAccumulator | undefined,
): ClusterAccumulator {
  if (accumulator === undefined) {
    throw new Error('echo cluster accumulator vanished');
  }
  return accumulator;
}
