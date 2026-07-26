import { describe, expect, it } from 'vitest';
import { assignSeatIds } from './assign-seat-ids';
import { CouncilDeclarationError } from './council-declaration-error';
import type { CouncilSeat } from './council-seat';
import type { SeatDraft } from './seat-draft';

function draft(role: string): SeatDraft {
  return {
    role,
    lens: role,
    proposer: false,
    contrarian: false,
    model: null,
  };
}

describe('assignSeatIds', () => {
  it('gives a single seat of a role the role name as its id', () => {
    expect(
      assignSeatIds([draft('reviewer')]).map(
        (seat: CouncilSeat): string => seat.id,
      ),
    ).toEqual(['reviewer']);
  });

  it('numbers the seats when a role holds more than one', () => {
    expect(
      assignSeatIds([draft('reviewer'), draft('reviewer')]).map(
        (seat: CouncilSeat): string => seat.id,
      ),
    ).toEqual(['reviewer-1', 'reviewer-2']);
  });

  it('keeps the draft fields of each seat', () => {
    expect(assignSeatIds([draft('reviewer')])[0]).toMatchObject({
      role: 'reviewer',
      lens: 'reviewer',
    });
  });

  it('refuses drafts whose numbering collides', () => {
    expect(() => assignSeatIds([draft('a'), draft('a'), draft('a-1')])).toThrow(
      CouncilDeclarationError,
    );
  });
});
