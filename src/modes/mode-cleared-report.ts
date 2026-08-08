export interface ModeClearedReport {
  readonly kind: 'cleared';
  readonly modes: readonly string[];
}
