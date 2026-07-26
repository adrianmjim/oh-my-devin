import { CouncilDeclarationError } from './council-declaration-error';
import type { CouncilSeat } from './council-seat';
import type { SeatDraft } from './seat-draft';

export function assignSeatIds(
  drafts: readonly SeatDraft[],
): readonly CouncilSeat[] {
  const totals: Map<string, number> = new Map<string, number>();
  for (const draft of drafts) {
    totals.set(draft.role, (totals.get(draft.role) ?? 0) + 1);
  }
  const occurrences: Map<string, number> = new Map<string, number>();
  const seats: readonly CouncilSeat[] = drafts.map(
    (draft: SeatDraft): CouncilSeat => {
      const total: number = totals.get(draft.role) ?? 0;
      const occurrence: number = (occurrences.get(draft.role) ?? 0) + 1;
      occurrences.set(draft.role, occurrence);
      const id: string = total > 1 ? `${draft.role}-${occurrence}` : draft.role;
      return { id, ...draft };
    },
  );
  const seen: Set<string> = new Set<string>();
  for (const seat of seats) {
    if (seen.has(seat.id)) {
      throw new CouncilDeclarationError(
        `seat id "${seat.id}" is claimed by more than one seat`,
      );
    }
    seen.add(seat.id);
  }
  return seats;
}
