export interface TeamRunCommand {
  readonly kind: 'team-run';
  readonly team: string;
  readonly task: string;
  readonly json: boolean;
}
