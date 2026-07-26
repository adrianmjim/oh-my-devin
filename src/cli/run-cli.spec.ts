import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsageError } from '../run/usage-error';
import { CLI_USAGE } from './cli-usage';
import { runCli } from './run-cli';

describe('runCli', () => {
  const originalArgv: readonly string[] = process.argv;
  let written: string[];

  beforeEach(() => {
    written = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(
      (chunk: unknown): boolean => {
        written.push(String(chunk));
        return true;
      },
    );
  });

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.restoreAllMocks();
  });

  it('prints usage and succeeds when invoked with no arguments', async () => {
    process.argv = ['node', 'omd'];

    expect(await runCli()).toBe(0);
    expect(written.join('')).toBe(CLI_USAGE);
  });

  it('reads the command from the process arguments', async () => {
    process.argv = ['node', 'omd', '--help'];

    expect(await runCli()).toBe(0);
    expect(written.join('')).toBe(CLI_USAGE);
  });

  it('surfaces an unknown command as a usage error', async () => {
    process.argv = ['node', 'omd', 'bogus'];

    await expect(runCli()).rejects.toThrow(UsageError);
  });
});
