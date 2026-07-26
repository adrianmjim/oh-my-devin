import type { ClaimBlocked } from './claim-blocked';
import type { EventsClaimed } from './events-claimed';

export type ClaimOutcome = EventsClaimed | ClaimBlocked;
