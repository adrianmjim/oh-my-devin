import type { ModeDelegation } from './mode-delegation';
import type { ModeLane } from './mode-lane';

export interface ModeSkill {
  readonly name: string;
  readonly lane: ModeLane;
  readonly delegatesTo: ModeDelegation;
  readonly content: string;
}
