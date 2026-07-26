export interface RunCommand {
  readonly kind: 'run';
  readonly role: string;
  readonly task: string;
  readonly json: boolean;
  readonly detach: boolean;
}
