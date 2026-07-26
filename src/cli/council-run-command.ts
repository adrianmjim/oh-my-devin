export interface CouncilRunCommand {
  readonly kind: 'council-run';
  readonly council: string;
  readonly question: string;
  readonly proposal: string | null;
  readonly team: string | null;
  readonly sign: boolean;
  readonly json: boolean;
}
