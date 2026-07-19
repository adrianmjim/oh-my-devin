export class HandoffError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'HandoffError';
  }
}
