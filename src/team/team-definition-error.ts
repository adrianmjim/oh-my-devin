export class TeamDefinitionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TeamDefinitionError';
  }
}
