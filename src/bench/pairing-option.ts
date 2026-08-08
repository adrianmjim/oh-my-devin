import type { KeywordItem } from './keyword-item';
import type { PairingCandidate } from './pairing-candidate';

export interface PairingOption {
  readonly item: KeywordItem;
  readonly candidate: PairingCandidate;
  readonly itemIndex: number;
  readonly candidateIndex: number;
  readonly score: number;
}
