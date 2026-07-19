export class DeliberationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'DeliberationError';
  }
}
