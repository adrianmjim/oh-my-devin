import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ProgressEvent } from './progress-event';

export class JournalWriter {
  private readonly journalPath: string;
  private directoryEnsured: boolean;

  public constructor(journalPath: string) {
    this.journalPath = journalPath;
    this.directoryEnsured = false;
  }

  public async append(event: ProgressEvent): Promise<void> {
    await this.ensureDirectory();
    await appendFile(this.journalPath, `${JSON.stringify(event)}\n`, 'utf8');
  }

  private async ensureDirectory(): Promise<void> {
    if (!this.directoryEnsured) {
      await mkdir(dirname(this.journalPath), { recursive: true });
      this.directoryEnsured = true;
    }
  }
}
