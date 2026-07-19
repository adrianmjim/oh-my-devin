export interface EchoCluster {
  readonly id: string;
  readonly claim: string;
  readonly endorsements: number;
  readonly seats: readonly string[];
}
