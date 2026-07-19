export class ContractCompilationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ContractCompilationError';
  }
}
