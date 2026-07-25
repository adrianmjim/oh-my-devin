export interface LineReader {
  next(prompt: string): Promise<string | null>;
  close(): void;
}
