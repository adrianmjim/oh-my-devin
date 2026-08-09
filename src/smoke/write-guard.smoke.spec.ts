import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BENCH_MODEL } from '../bench/bench-model';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import type { SessionListing } from '../engine/session-listing';
import { projectConfigPath } from '../guard/project-config-path';
import { SMOKE_SCRATCH_DIR } from '../testing/smoke-scratch-dir';
import { devinTranscriptPath } from '../testing/devin-transcript-path';
import { writeOmdShimBin } from '../testing/write-omd-shim-bin';

const smokeEnabled: boolean = process.env['OMD_SMOKE'] === '1';

const CLI_PATH: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'dist',
  'cli.js',
);

const SETUP_TIMEOUT_MS: number = 60000;
const TURN_TIMEOUT_MS: number = 600000;

const TARGET: string = 'src/guarded.ts';

const WRITE_PROMPT: string = [
  `Create the file ${TARGET} with the single line "export const a = 1;".`,
  'Use your file-writing tool, not a shell command. Do nothing else.',
].join(' ');

interface HookSpecificOutput {
  readonly additionalContext?: string;
}

interface HookOutput {
  readonly hookSpecificOutput?: HookSpecificOutput;
}

function runOmd(cwd: string, argv: readonly string[]): Promise<CommandResult> {
  return new Promise<CommandResult>(
    (
      resolvePromise: (result: CommandResult) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        process.execPath,
        [CLI_PATH, ...argv],
        { cwd },
      );
      let stdout: string = '';
      let stderr: string = '';
      child.stdout.on('data', (chunk: Buffer): void => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer): void => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code: number | null): void => {
        resolvePromise({ stdout, stderr, exitCode: code ?? 1 });
      });
      child.stdin.end();
    },
  );
}

function runHook(
  cwd: string,
  phase: string,
  event: unknown,
): Promise<HookOutput> {
  return new Promise<HookOutput>(
    (
      resolvePromise: (output: HookOutput) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        process.execPath,
        [join(cwd, '.devin', 'hooks', 'omd-mode.mjs'), phase],
        { cwd },
      );
      let stdout: string = '';
      child.stdout.on('data', (chunk: Buffer): void => {
        stdout += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (): void => {
        resolvePromise(JSON.parse(stdout) as HookOutput);
      });
      child.stdin.write(JSON.stringify(event));
      child.stdin.end();
    },
  );
}

async function exists(path: string): Promise<boolean> {
  let found: boolean;
  try {
    await stat(path);
    found = true;
  } catch {
    found = false;
  }
  return found;
}

describe('write guard smoke suite', () => {
  it('requires OMD_SMOKE=1 to run the smoke tier', () => {
    expect(smokeEnabled).toBe(true);
  });

  describe.runIf(smokeEnabled)('against the installed Devin CLI', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();
    let scratchDir: string;
    let runner: ProcessCommandRunner;

    async function configure(level: string): Promise<void> {
      await mkdir(join(scratchDir, '.omd'), { recursive: true });
      await writeFile(
        projectConfigPath(scratchDir),
        `guard:\n  level: ${level}\n`,
        'utf8',
      );
    }

    function writeTurn(): CommandInvocation {
      return {
        command: 'devin',
        args: [
          '-p',
          WRITE_PROMPT,
          '--model',
          BENCH_MODEL,
          '--permission-mode',
          'dangerous',
          '--respect-workspace-trust',
          'false',
        ],
      };
    }

    async function currentSessionId(): Promise<string> {
      const listed: CommandResult = await runner.run(engine.listInvocation());
      expect(listed.exitCode, listed.stderr).toBe(0);
      const sessions: readonly SessionListing[] = engine.parseSessionListing(
        listed.stdout,
      );
      const match: SessionListing | undefined = sessions.find(
        (session: SessionListing): boolean =>
          session.workingDirectory === scratchDir,
      );
      expect(match, 'the real session for the scratch project').toBeDefined();
      return match?.id ?? '';
    }

    beforeAll(async () => {
      await mkdir(SMOKE_SCRATCH_DIR, { recursive: true });
      scratchDir = await realpath(
        await mkdtemp(join(SMOKE_SCRATCH_DIR, 'omd-guard-smoke-')),
      );
      const binDir: string = join(scratchDir, '.omd', 'smoke-bin');
      await writeOmdShimBin(binDir);
      process.env['PATH'] = `${binDir}${delimiter}${process.env['PATH'] ?? ''}`;
      runner = new ProcessCommandRunner(scratchDir);
      const setup: CommandResult = await runOmd(scratchDir, ['setup']);
      expect(setup.exitCode, setup.stderr).toBe(0);
    }, SETUP_TIMEOUT_MS);

    afterAll(async () => {
      await rm(scratchDir, { recursive: true, force: true });
    });

    it(
      'blocks an out-of-scope write at strict with the reason in the session',
      async () => {
        await configure('strict');

        const turn: CommandResult = await runner.run(writeTurn());
        expect(turn.exitCode, turn.stderr).toBe(0);

        expect(
          await exists(join(scratchDir, TARGET)),
          'the blocked write never lands',
        ).toBe(false);

        const transcript: string = await readFile(
          devinTranscriptPath(
            process.env['XDG_DATA_HOME'],
            homedir(),
            await currentSessionId(),
          ),
          'utf8',
        );

        expect(
          transcript,
          'the block reaches the session as a tool message',
        ).toContain('Tool blocked');
        expect(transcript, 'the guard reason travels with the block').toContain(
          'omd roles list',
        );
      },
      TURN_TIMEOUT_MS,
    );

    it(
      'lands a warned write and notices it on the next prompt',
      async () => {
        await configure('warn');
        await rm(join(scratchDir, TARGET), { force: true });

        const turn: CommandResult = await runner.run(writeTurn());
        expect(turn.exitCode, turn.stderr).toBe(0);

        expect(
          await exists(join(scratchDir, TARGET)),
          'the warned write lands',
        ).toBe(true);

        const injected: HookOutput = await runHook(scratchDir, 'user-prompt', {
          hook_event_name: 'UserPromptSubmit',
          session_id: await currentSessionId(),
          prompt: 'continue',
        });

        expect(injected.hookSpecificOutput?.additionalContext).toContain(
          TARGET,
        );
      },
      TURN_TIMEOUT_MS,
    );
  });
});
