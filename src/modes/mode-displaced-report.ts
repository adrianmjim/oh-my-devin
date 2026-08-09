export interface ModeDisplacedReport {
  readonly kind: 'displaced';
  readonly mode: string;
  readonly displaced: string;
}
