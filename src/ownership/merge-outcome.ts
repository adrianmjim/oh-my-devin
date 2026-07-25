export interface MergeCreated {
  readonly kind: 'created';
  readonly content: string;
}

export interface MergeUpdated {
  readonly kind: 'updated';
  readonly content: string;
}

export interface MergeUnchanged {
  readonly kind: 'unchanged';
}

export interface MergePreserved {
  readonly kind: 'preserved';
  readonly reason: string;
}

export interface MergeConflicted {
  readonly kind: 'conflicted';
  readonly reason: string;
}

export interface MergeBlocked {
  readonly kind: 'blocked';
  readonly reason: string;
}

export type MergeOutcome =
  | MergeCreated
  | MergeUpdated
  | MergeUnchanged
  | MergePreserved
  | MergeConflicted
  | MergeBlocked;

export const EDITED_REASON: string =
  'its omd region has been edited since it was installed';
