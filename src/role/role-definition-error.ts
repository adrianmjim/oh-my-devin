export class RoleDefinitionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'RoleDefinitionError';
  }
}
