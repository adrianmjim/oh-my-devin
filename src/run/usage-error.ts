export class UsageError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'UsageError';
  }
}
