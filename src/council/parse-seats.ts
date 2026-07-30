import { assignSeatIds } from './assign-seat-ids';
import { CouncilDeclarationError } from './council-declaration-error';
import type { CouncilSeat } from './council-seat';
import { parseSeatDraft } from './parse-seat-draft';
import type { RoleWriteScopes } from '../catalog/role-write-scopes';
import type { SeatDraft } from './seat-draft';

export function parseSeats(
  value: unknown,
  roleScopes: RoleWriteScopes,
): readonly CouncilSeat[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CouncilDeclarationError('"seats" must be a non-empty list');
  }
  const drafts: readonly SeatDraft[] = value.map(
    (entry: unknown, index: number): SeatDraft =>
      parseSeatDraft(entry, index, roleScopes),
  );
  return assignSeatIds(drafts);
}
