import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { openSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { generateRunId } from '../observability/generate-run-id';
import { RUN_ID_ENV } from '../observability/run-id-env';
import type { RunId } from '../observability/run-id';
import { RunRecordPaths } from '../observability/run-record-paths';
import { validateRunInvocation } from './validate-run-invocation';

export async function launchDetached(
  baseDir: string,
  cliPath: string,
  roleName: string,
  task: string,
): Promise<RunId> {
  await validateRunInvocation(baseDir, roleName, task);
  const runId: RunId = generateRunId();
  const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
  await mkdir(paths.dir, { recursive: true });
  const stdoutFd: number = openSync(paths.stdout, 'a');
  const stderrFd: number = openSync(paths.stderr, 'a');
  const child: ChildProcess = spawn(
    process.execPath,
    [cliPath, 'run', roleName, task],
    {
      cwd: baseDir,
      detached: true,
      stdio: ['ignore', stdoutFd, stderrFd],
      env: { ...process.env, [RUN_ID_ENV]: runId },
    },
  );
  child.unref();
  return runId;
}
