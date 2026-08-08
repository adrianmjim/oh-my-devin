export class BenchFixtureError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'BenchFixtureError';
  }
}
