import { readFile } from 'node:fs/promises';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { UsageError } from '../run/usage-error';
import { CLI_USAGE } from './cli-usage';
import { dispatchCliCommand } from './dispatch-cli-command';
import { renderCliError } from './render-cli-error';

describe('dispatchCliCommand', () => {
  let cwd: string;
  let userConfigDir: string;
  let runner: ProcessCommandRunner;
  let written: string[];

  async function scaffoldConstructor(): Promise<void> {
    const roleDir: string = join(cwd, '.devin', 'agents', 'executor');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      [
        '---',
        'omd-output: evidence.json',
        'omd-schema: evidence.schema.json',
        'omd-max-turns: 12',
        'omd-write-scope: worktree',
        '---',
        'You are the executor.',
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      join(cwd, 'evidence.schema.json'),
      JSON.stringify({ type: 'object' }),
    );
  }

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'omd-dispatch-project-'));
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-dispatch-user-'));
    runner = new ProcessCommandRunner(cwd);
    written = [];
    vi.spyOn(process.stdout, 'write').mockImplementation(
      (chunk: unknown): boolean => {
        written.push(String(chunk));
        return true;
      },
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(cwd, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('prints the usage block and succeeds for help', async () => {
    const code: number = await dispatchCliCommand(
      { kind: 'help' },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toBe(CLI_USAGE);
  });

  it('prints the installed version and succeeds for version', async () => {
    const manifest: Record<string, unknown> = JSON.parse(
      await readFile(resolve('package.json'), 'utf8'),
    ) as Record<string, unknown>;

    const code: number = await dispatchCliCommand(
      { kind: 'version' },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toBe(`${String(manifest['version'])}\n`);
  });

  it('persists the requested mode state for mode-set', async () => {
    const code: number = await dispatchCliCommand(
      { kind: 'mode-set', mode: 'ralph' },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('mode set: ralph');
    expect(await readFile(join(cwd, '.omd', 'mode.json'), 'utf8')).toContain(
      'ralph',
    );
  });

  it('drops the persisted mode state for mode-clear', async () => {
    await dispatchCliCommand(
      { kind: 'mode-set', mode: 'ralph' },
      cwd,
      userConfigDir,
      runner,
    );

    const code: number = await dispatchCliCommand(
      { kind: 'mode-clear' },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('mode cleared');
    await expect(
      readFile(join(cwd, '.omd', 'mode.json'), 'utf8'),
    ).rejects.toThrow();
  });

  it('refuses a worktree-scoped role for a blocking run, as a usage error', async () => {
    await scaffoldConstructor();

    const rejection: unknown = await dispatchCliCommand(
      {
        kind: 'run',
        role: 'executor',
        task: 'implement',
        json: false,
        detach: false,
      },
      cwd,
      userConfigDir,
      runner,
    ).catch((error: unknown): unknown => error);

    expect(rejection).toBeInstanceOf(UsageError);
    expect(renderCliError(rejection, false).exitCode).toBe(64);
    expect(renderCliError(rejection, false).stderrText).toContain(
      'role "executor" declares the "worktree" write scope',
    );
  });

  it('refuses a worktree-scoped role for a detached run before launching it', async () => {
    await scaffoldConstructor();

    const rejection: unknown = await dispatchCliCommand(
      {
        kind: 'run',
        role: 'executor',
        task: 'implement',
        json: false,
        detach: true,
      },
      cwd,
      userConfigDir,
      runner,
    ).catch((error: unknown): unknown => error);

    expect(rejection).toBeInstanceOf(UsageError);
    expect(renderCliError(rejection, false).exitCode).toBe(64);
    expect(written.join('')).toBe('');
  });
});
