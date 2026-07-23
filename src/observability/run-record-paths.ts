import { join } from 'node:path';
import type { RunId } from './run-id';

export class RunRecordPaths {
  public readonly dir: string;
  public readonly journal: string;
  public readonly liveness: string;
  public readonly stdout: string;
  public readonly stderr: string;

  public constructor(baseDir: string, runId: RunId) {
    this.dir = join(baseDir, '.omd', 'runs', runId);
    this.journal = join(this.dir, 'events.jsonl');
    this.liveness = join(this.dir, 'liveness.json');
    this.stdout = join(this.dir, 'stdout.log');
    this.stderr = join(this.dir, 'stderr.log');
  }
}
