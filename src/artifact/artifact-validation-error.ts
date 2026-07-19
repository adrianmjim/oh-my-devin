export class ArtifactValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ArtifactValidationError';
  }
}
