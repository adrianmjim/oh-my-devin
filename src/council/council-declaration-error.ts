export class CouncilDeclarationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'CouncilDeclarationError';
  }
}
