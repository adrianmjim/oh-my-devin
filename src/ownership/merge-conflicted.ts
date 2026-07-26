export interface MergeConflicted {
  readonly kind: 'conflicted';
  readonly reason: string;
}
