export class PipelineError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'PipelineError';
  }
}
