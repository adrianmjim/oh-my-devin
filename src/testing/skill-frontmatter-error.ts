export class SkillFrontmatterError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'SkillFrontmatterError';
  }
}
