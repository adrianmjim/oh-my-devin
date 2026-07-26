import type { MergeBlocked } from './merge-blocked';
import type { MergeConflicted } from './merge-conflicted';
import type { MergeCreated } from './merge-created';
import type { MergePreserved } from './merge-preserved';
import type { MergeUnchanged } from './merge-unchanged';
import type { MergeUpdated } from './merge-updated';

export type MergeOutcome =
  | MergeCreated
  | MergeUpdated
  | MergeUnchanged
  | MergePreserved
  | MergeConflicted
  | MergeBlocked;
