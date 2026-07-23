import type { JournalWriter } from './journal-writer';
import type { LivenessRefresher } from './liveness-refresher';
import type { ProgressEvent } from './progress-event';
import type { RunObserver } from './run-observer';

export class JournalRunRecorder implements RunObserver {
  private readonly journal: JournalWriter;
  private readonly liveness: LivenessRefresher;

  public constructor(journal: JournalWriter, liveness: LivenessRefresher) {
    this.journal = journal;
    this.liveness = liveness;
  }

  public async append(event: ProgressEvent): Promise<void> {
    await this.journal.append(event);
    if (event.type === 'runLaunched') {
      await this.liveness.refreshNow().catch((): void => undefined);
      this.liveness.start();
    } else if (event.type === 'terminalOutcome') {
      this.liveness.stop();
    }
  }

  public close(): void {
    this.liveness.stop();
  }
}
