import type { JournalWriter } from './journal-writer';
import type { LivenessRefresher } from './liveness-refresher';
import type { ProgressEvent } from './progress-event';
import type { RunClaim } from './run-claim';
import type { RunId } from './run-id';
import type { RunObserver } from './run-observer';
import { writeRunClaim } from './write-run-claim';

export class JournalRunRecorder implements RunObserver {
  private readonly journal: JournalWriter;
  private readonly liveness: LivenessRefresher;
  private readonly baseDir: string;
  private readonly runId: RunId;

  public constructor(
    journal: JournalWriter,
    liveness: LivenessRefresher,
    baseDir: string,
    runId: RunId,
  ) {
    this.journal = journal;
    this.liveness = liveness;
    this.baseDir = baseDir;
    this.runId = runId;
  }

  public async append(event: ProgressEvent): Promise<void> {
    if (event.type === 'runLaunched') {
      await this.liveness.refreshNow().catch((): void => undefined);
      this.liveness.start();
    }
    await this.journal.append(event);
    if (event.type === 'terminalOutcome') {
      this.liveness.stop();
    }
  }

  public async claim(claim: RunClaim): Promise<void> {
    await writeRunClaim(this.baseDir, this.runId, claim);
  }

  public close(): void {
    this.liveness.stop();
  }
}
