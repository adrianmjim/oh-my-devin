export interface ModeJoinedReport {
  readonly kind: 'joined';
  readonly mode: string;
  readonly alongside: readonly string[];
}
