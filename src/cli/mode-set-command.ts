export interface ModeSetCommand {
  readonly kind: 'mode-set';
  readonly mode: string;
}
