import type { AuthorityPolicy } from './authority-policy';
import type { CouncilSeat } from './council-seat';
import type { DeliberationTunables } from './deliberation-tunables';

export interface CouncilDeclaration {
  readonly name: string;
  readonly seats: readonly CouncilSeat[];
  readonly tunables: DeliberationTunables;
  readonly authority: AuthorityPolicy;
}
