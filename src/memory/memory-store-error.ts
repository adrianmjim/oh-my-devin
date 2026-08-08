export class MemoryStoreError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'MemoryStoreError';
  }
}
