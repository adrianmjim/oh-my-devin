import { readFile } from 'node:fs/promises';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { MEMORY_CLASS_CAP } from '../memory/memory-class-cap';
import type { NotepadEntry } from '../memory/notepad-entry';
import { readNotepad } from '../memory/read-notepad';
import type { ModeActivation } from '../modes/mode-activation';
import { readSessionSlots } from '../modes/read-session-slots';
import { recordSessionSeen } from '../modes/record-session-seen';
import { stageSessionIdentity } from '../modes/stage-session-identity';
import type { JsonRunListing } from '../observability/json-run-listing';
import { JournalWriter } from '../observability/journal-writer';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeLivenessStamp } from '../observability/write-liveness-stamp';
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

  async function stageMode(invocation: string): Promise<void> {
    await recordSessionSeen(cwd, 'sess-1', Date.now());
    await stageSessionIdentity(cwd, 'sess-1', `omd ${invocation}`, Date.now());
  }

  it('records the requested mode against the staging session', async () => {
    await stageMode('mode set ralph');

    const code: number = await dispatchCliCommand(
      {
        kind: 'mode-set',
        mode: 'ralph',
        runId: null,
        invocation: 'mode set ralph',
      },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('mode set: ralph');
    const held: readonly ModeActivation[] = await readSessionSlots(
      cwd,
      'sess-1',
    );
    expect(held.map((slot: ModeActivation): string => slot.mode)).toEqual([
      'ralph',
    ]);
  });

  it('refuses an unattributable mode-set with a non-zero code', async () => {
    const code: number = await dispatchCliCommand(
      {
        kind: 'mode-set',
        mode: 'ralph',
        runId: null,
        invocation: 'mode set ralph',
      },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).not.toBe(0);
    expect(written.join('')).toContain('mode refused: ralph');
  });

  it('rejects a mode outside the state catalog', async () => {
    await stageMode('mode set deep-dive');

    await expect(
      dispatchCliCommand(
        {
          kind: 'mode-set',
          mode: 'deep-dive',
          runId: null,
          invocation: 'mode set deep-dive',
        },
        cwd,
        userConfigDir,
        runner,
      ),
    ).rejects.toThrow(UsageError);
  });

  it('resolves mode state from the project root for a nested cwd', async () => {
    await stageMode('mode set plan');
    const nested: string = join(cwd, 'packages', 'app');
    await mkdir(nested, { recursive: true });

    const code: number = await dispatchCliCommand(
      {
        kind: 'mode-set',
        mode: 'plan',
        runId: null,
        invocation: 'mode set plan',
      },
      nested,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(await readSessionSlots(cwd, 'sess-1')).toHaveLength(1);
  });

  it('rejects clearing a mode outside the state catalog', async () => {
    await stageMode('mode clear rlahp');

    await expect(
      dispatchCliCommand(
        { kind: 'mode-clear', mode: 'rlahp', invocation: 'mode clear rlahp' },
        cwd,
        userConfigDir,
        runner,
      ),
    ).rejects.toThrow(UsageError);
  });

  it('deactivates the session own slot for mode-clear', async () => {
    await stageMode('mode set ralph');
    await dispatchCliCommand(
      {
        kind: 'mode-set',
        mode: 'ralph',
        runId: null,
        invocation: 'mode set ralph',
      },
      cwd,
      userConfigDir,
      runner,
    );
    await stageMode('mode clear');

    const code: number = await dispatchCliCommand(
      { kind: 'mode-clear', mode: null, invocation: 'mode clear' },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('mode cleared: ralph');
    expect(await readSessionSlots(cwd, 'sess-1')).toEqual([]);
  });

  it('writes no mode.json for either verb', async () => {
    await stageMode('mode set ralph');
    await dispatchCliCommand(
      {
        kind: 'mode-set',
        mode: 'ralph',
        runId: null,
        invocation: 'mode set ralph',
      },
      cwd,
      userConfigDir,
      runner,
    );

    await expect(
      readFile(join(cwd, '.omd', 'mode.json'), 'utf8'),
    ).rejects.toThrow();
  });

  it('appends a manual notepad entry for memory-remember', async () => {
    const code: number = await dispatchCliCommand(
      { kind: 'memory-remember', text: 'the gate runs on staging' },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('remembered');
    const entries: readonly NotepadEntry[] = await readNotepad(cwd);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.kind).toBe('manual');
    expect(entries[0]?.text).toBe('the gate runs on staging');
  });

  it('collapses a repeated memory-remember to one entry', async () => {
    for (let attempt: number = 0; attempt < 3; attempt++) {
      await dispatchCliCommand(
        { kind: 'memory-remember', text: 'the gate runs on staging' },
        cwd,
        userConfigDir,
        runner,
      );
    }

    expect(await readNotepad(cwd)).toHaveLength(1);
  });

  it('holds the notepad within its cap across many memory-remember calls', async () => {
    for (let index: number = 0; index < MEMORY_CLASS_CAP.notepad + 5; index++) {
      await dispatchCliCommand(
        { kind: 'memory-remember', text: `note ${index}` },
        cwd,
        userConfigDir,
        runner,
      );
    }

    expect(await readNotepad(cwd)).toHaveLength(MEMORY_CLASS_CAP.notepad);
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
  it('renders the cross-run listing and succeeds for status-list', async () => {
    const paths: RunRecordPaths = new RunRecordPaths(cwd, 'run-live');
    await mkdir(paths.dir, { recursive: true });
    const writer: JournalWriter = new JournalWriter(paths.journal);
    await writer.append({
      type: 'runLaunched',
      timestamp: Date.now(),
      runId: 'run-live',
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: 'review.json',
    });
    await writeLivenessStamp(paths.liveness, Date.now());

    const code: number = await dispatchCliCommand(
      { kind: 'status-list', json: false },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('omd status — 1 run');
    expect(written.join('')).toContain('run-live');
  });

  it('emits the listing as JSON for status-list under --json', async () => {
    const paths: RunRecordPaths = new RunRecordPaths(cwd, 'run-live');
    await mkdir(paths.dir, { recursive: true });
    const writer: JournalWriter = new JournalWriter(paths.journal);
    await writer.append({
      type: 'runLaunched',
      timestamp: Date.now(),
      runId: 'run-live',
      runKind: 'single-role',
      subject: 'reviewer',
      maxTurns: 8,
      artifactPath: 'review.json',
    });
    await writeLivenessStamp(paths.liveness, Date.now());

    const code: number = await dispatchCliCommand(
      { kind: 'status-list', json: true },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    const listing: JsonRunListing = JSON.parse(
      written.join('').trim(),
    ) as JsonRunListing;
    expect(listing.runs).toHaveLength(1);
    expect(listing.runs[0]?.runId).toBe('run-live');
    expect(listing.runs[0]?.state).toBe('running');
  });

  it('renders an empty listing and succeeds in a project with no runs', async () => {
    const code: number = await dispatchCliCommand(
      { kind: 'status-list', json: false },
      cwd,
      userConfigDir,
      runner,
    );

    expect(code).toBe(0);
    expect(written.join('')).toContain('no active or recent runs');
  });
});
