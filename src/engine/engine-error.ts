export class EngineError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'EngineError';
  }
}
