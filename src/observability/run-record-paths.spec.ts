import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RunRecordPaths } from './run-record-paths';

describe('RunRecordPaths', () => {
  const baseDir: string = '/projects/widget';
  const runId: string = 'run-1234';

  it('resolves the record directory under .omd/runs/<runId>', () => {
    const paths = new RunRecordPaths(baseDir, runId);

    expect(paths.dir).toBe(join(baseDir, '.omd', 'runs', runId));
  });

  it('resolves the journal file inside the record directory', () => {
    const paths = new RunRecordPaths(baseDir, runId);

    expect(paths.journal).toBe(
      join(baseDir, '.omd', 'runs', runId, 'events.jsonl'),
    );
  });

  it('resolves the liveness stamp inside the record directory', () => {
    const paths = new RunRecordPaths(baseDir, runId);

    expect(paths.liveness).toBe(
      join(baseDir, '.omd', 'runs', runId, 'liveness.json'),
    );
  });

  it('resolves the captured stdio files inside the record directory', () => {
    const paths = new RunRecordPaths(baseDir, runId);

    expect(paths.stdout).toBe(
      join(baseDir, '.omd', 'runs', runId, 'stdout.log'),
    );
    expect(paths.stderr).toBe(
      join(baseDir, '.omd', 'runs', runId, 'stderr.log'),
    );
  });

  it('keeps records for distinct run identities in separate directories', () => {
    const first = new RunRecordPaths(baseDir, 'run-a');
    const second = new RunRecordPaths(baseDir, 'run-b');

    expect(first.dir).not.toBe(second.dir);
  });
});
