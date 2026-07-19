export class ParallelError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ParallelError';
  }
}
