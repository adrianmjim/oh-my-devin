import type { ClaimKeyOf } from './claim-key-of';
import type { SeatArgument } from './seat-argument';

export const normalizeClaimKey: ClaimKeyOf = (argument: SeatArgument): string =>
  argument.claim.trim().toLowerCase().replace(/\s+/g, ' ');
