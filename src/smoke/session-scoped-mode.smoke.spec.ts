import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BENCH_MODEL } from '../bench/bench-model';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import type { SessionListing } from '../engine/session-listing';
import type { ModeActivation } from '../modes/mode-activation';
import { readSessionSlots } from '../modes/read-session-slots';
import { SMOKE_SCRATCH_DIR } from '../testing/smoke-scratch-dir';
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

const ACTIVATION_PROMPT: string = [
  'Read .devin/skills/ralph/SKILL.md and run only its activation command,',
  'exactly as written: the bare `omd mode set ralph`, not the --run variant.',
  'Run no other command and change no files.',
].join(' ');

interface HookOutput {
  readonly decision?: string;
  readonly reason?: string;
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

describe('session-scoped mode state smoke suite', () => {
  it('requires OMD_SMOKE=1 to run the smoke tier', () => {
    expect(smokeEnabled).toBe(true);
  });

  describe.runIf(smokeEnabled)('against the installed Devin CLI', () => {
    const engine: DevinHeadlessEngine = new DevinHeadlessEngine();
    let scratchDir: string;
    let binDir: string;
    let inheritedPath: string;
    let runner: ProcessCommandRunner;

    beforeAll(async () => {
      await mkdir(SMOKE_SCRATCH_DIR, { recursive: true });
      scratchDir = await realpath(
        await mkdtemp(join(SMOKE_SCRATCH_DIR, 'omd-mode-smoke-')),
      );
      binDir = join(scratchDir, '.omd-smoke-bin');
      await writeOmdShimBin(binDir);
      inheritedPath = process.env['PATH'] ?? '';
      process.env['PATH'] = `${binDir}${delimiter}${inheritedPath}`;
      runner = new ProcessCommandRunner(scratchDir);
      const setup: CommandResult = await runOmd(scratchDir, ['setup']);
      expect(setup.exitCode, setup.stderr).toBe(0);
    }, SETUP_TIMEOUT_MS);

    afterAll(async () => {
      process.env['PATH'] = inheritedPath;
      await rm(scratchDir, { recursive: true, force: true });
    });

    it(
      'attributes a mode set through the skill to the real session and gates that session stop',
      async () => {
        const turn: CommandInvocation = {
          command: 'devin',
          args: [
            '-p',
            ACTIVATION_PROMPT,
            '--model',
            BENCH_MODEL,
            '--permission-mode',
            'dangerous',
            '--respect-workspace-trust',
            'false',
          ],
        };
        const activated: CommandResult = await runner.run(turn);
        expect(activated.exitCode, activated.stderr).toBe(0);

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
        const sessionId: string = match?.id ?? '';

        const slots: readonly ModeActivation[] = await readSessionSlots(
          scratchDir,
          sessionId,
        );
        expect(
          slots.map((slot: ModeActivation): string => slot.mode),
          'the activation is attributed to the real session',
        ).toContain('ralph');
        expect(
          slots.every(
            (slot: ModeActivation): boolean => slot.sessionId === sessionId,
          ),
        ).toBe(true);

        const blocked: HookOutput = await runHook(scratchDir, 'stop', {
          hook_event_name: 'Stop',
          session_id: sessionId,
        });
        expect(blocked.decision).toBe('block');
        expect(blocked.reason).toContain('ralph');

        const foreign: HookOutput = await runHook(scratchDir, 'stop', {
          hook_event_name: 'Stop',
          session_id: 'omd-smoke-foreign-session',
        });
        expect(foreign.decision).toBe('approve');
      },
      TURN_TIMEOUT_MS,
    );
  });
});
