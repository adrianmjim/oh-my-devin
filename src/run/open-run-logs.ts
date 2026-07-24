import { closeSync, openSync } from 'node:fs';
import type { RunRecordPaths } from '../observability/run-record-paths';
import type { RunLogDescriptors } from './run-log-descriptors';

export function openRunLogs(paths: RunRecordPaths): RunLogDescriptors {
  const stdoutFd: number = openSync(paths.stdout, 'a');
  let stderrFd: number;
  try {
    stderrFd = openSync(paths.stderr, 'a');
  } catch (error: unknown) {
    closeSync(stdoutFd);
    throw error;
  }
  return { stdoutFd, stderrFd };
}
