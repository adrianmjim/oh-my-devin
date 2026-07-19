export interface SeatClarification {
  readonly seat: string;
  readonly lens: string;
  readonly kind: 'clarification';
  readonly questions: readonly string[];
}
