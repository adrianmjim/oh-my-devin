export interface RuleEntry {
  readonly text: string;
  readonly globs: readonly string[];
  readonly hash: string;
  readonly recordedAt: number;
}
