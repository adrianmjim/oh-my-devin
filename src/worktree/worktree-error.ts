export class WorktreeError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'WorktreeError';
  }
}
