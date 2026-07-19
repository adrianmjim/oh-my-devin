export interface CouncilSeat {
  readonly role: string;
  readonly lens: string;
  readonly proposer: boolean;
  readonly contrarian: boolean;
  readonly model: string | null;
}
