import type { CouncilSeat } from '../council/council-seat';
import type { RoundInput } from './round-input';

export function proposerSeat(input: RoundInput): CouncilSeat | undefined {
  return input.council.seats.find(
    (seat: CouncilSeat): boolean => seat.proposer,
  );
}
