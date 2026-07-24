import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Clock } from '../budget/clock';
import type { IntervalHandle, IntervalScheduler } from './interval-scheduler';
import { JournalRunRecorder } from './journal-run-recorder';
import { JournalWriter } from './journal-writer';
import { LivenessRefresher } from './liveness-refresher';
import type { ProgressEvent } from './progress-event';
import { readJournal } from './read-journal';
import { readLivenessStamp } from './read-liveness-stamp';
import { RunRecordPaths } from './run-record-paths';

interface SchedulerProbe {
  scheduleCount: number;
  cancelCount: number;
}

function probeScheduler(probe: SchedulerProbe): IntervalScheduler {
  return (): IntervalHandle => {
    probe.scheduleCount += 1;
    return (): void => {
      probe.cancelCount += 1;
    };
  };
}

class StampCheckingWriter extends JournalWriter {
  public stampSeenOnLaunchAppend: boolean | null = null;

  public constructor(
    journalPath: string,
    private readonly stampPath: string,
  ) {
    super(journalPath);
  }

  public override async append(event: ProgressEvent): Promise<void> {
    if (event.type === 'runLaunched') {
      this.stampSeenOnLaunchAppend =
        (await readLivenessStamp(this.stampPath)) !== null;
    }
    await super.append(event);
  }
}

const LAUNCHED: ProgressEvent = {
  type: 'runLaunched',
  timestamp: 1000,
  runId: 'run-1',
  runKind: 'single-role',
  subject: 'reviewer',
  maxTurns: 8,
  artifactPath: 'review.json',
};

const TERMINAL: ProgressEvent = {
  type: 'terminalOutcome',
  timestamp: 3000,
  succeeded: true,
  failureTier: null,
};

describe('JournalRunRecorder', () => {
  let base: string = '';
  let paths: RunRecordPaths;
  let probe: SchedulerProbe;
  let recorder: JournalRunRecorder;
  const clock: Clock = (): number => 1000;

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-recorder-'));
    paths = new RunRecordPaths(base, 'run-1');
    probe = { scheduleCount: 0, cancelCount: 0 };
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      probeScheduler(probe),
    );
    recorder = new JournalRunRecorder(
      new JournalWriter(paths.journal),
      refresher,
    );
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('appends every event to the journal', async () => {
    await recorder.append(LAUNCHED);
    await recorder.append(TERMINAL);

    expect(await readJournal(paths.journal)).toEqual([LAUNCHED, TERMINAL]);
  });

  it('starts the liveness heartbeat when the run launches', async () => {
    await recorder.append(LAUNCHED);

    expect(probe.scheduleCount).toBe(1);
  });

  it('writes an eager liveness stamp at launch so a just-launched run reads live', async () => {
    await recorder.append(LAUNCHED);

    expect((await readLivenessStamp(paths.liveness))?.stampedAt).toBe(1000);
  });

  it('writes the liveness stamp before the launch event becomes visible', async () => {
    const writer = new StampCheckingWriter(paths.journal, paths.liveness);
    const refresher = new LivenessRefresher(
      paths.liveness,
      clock,
      15000,
      probeScheduler(probe),
    );
    const ordered = new JournalRunRecorder(writer, refresher);

    await ordered.append(LAUNCHED);

    expect(writer.stampSeenOnLaunchAppend).toBe(true);
  });

  it('stops the liveness heartbeat when the run terminates', async () => {
    await recorder.append(LAUNCHED);
    await recorder.append(TERMINAL);

    expect(probe.cancelCount).toBe(1);
  });

  it('stops the liveness heartbeat on close as a safety net', async () => {
    await recorder.append(LAUNCHED);
    recorder.close();

    expect(probe.cancelCount).toBe(1);
  });
});
