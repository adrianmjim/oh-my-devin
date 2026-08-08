export interface HookCommand {
  readonly kind: 'hook';
  readonly phase: string;
}
