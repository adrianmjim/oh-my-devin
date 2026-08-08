export interface ModeClearCommand {
  readonly kind: 'mode-clear';
  readonly mode: string | null;
  readonly invocation: string;
}
