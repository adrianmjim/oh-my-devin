export interface ProfileSnapshot {
  readonly stack: readonly string[];
  readonly layout: readonly string[];
  readonly entryCommands: readonly string[];
  readonly derivedAt: number;
}
