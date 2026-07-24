export interface ArtifactValidatedEvent {
  readonly type: 'artifactValidated';
  readonly timestamp: number;
  readonly artifactPath: string;
  readonly valid: boolean;
  readonly missing: boolean;
}
