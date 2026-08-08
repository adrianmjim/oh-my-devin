export interface KnowledgeEntry {
  readonly text: string;
  readonly triggers: readonly string[];
  readonly hash: string;
  readonly recordedAt: number;
}
