export interface ArtifactValidation {
  readonly valid: boolean;
  readonly missing: boolean;
  readonly errors: readonly string[];
}
