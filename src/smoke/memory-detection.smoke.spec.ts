import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BENCH_MODEL } from '../bench/bench-model';
import { readStagedCandidates } from '../detection/read-staged-candidates';
import type { StagedCandidate } from '../detection/staged-candidate';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { contentHash } from '../memory/content-hash';
import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { MemoryStorePaths } from '../memory/memory-store-paths';
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

const DIRECTIVE_PROMPT: string = [
  'Remember this working rule and then stop:',
  'always run the migration check before deploying.',
  'Run no command and change no file.',
].join(' ');

const DEPLOY_KNOWLEDGE: KnowledgeEntry = {
  text: 'the deploy gate is manual in this project',
  triggers: ['deploy'],
  hash: contentHash('the deploy gate is manual in this project'),
  recordedAt: 1,
};

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

describe('memory detection smoke suite', () => {
  it('requires OMD_SMOKE=1 to run the smoke tier', () => {
    expect(smokeEnabled).toBe(true);
  });

  describe.runIf(smokeEnabled)('against the installed Devin CLI', () => {
    let scratchDir: string;
    let binDir: string;
    let inheritedPath: string;
    let runner: ProcessCommandRunner;

    beforeAll(async () => {
      await mkdir(SMOKE_SCRATCH_DIR, { recursive: true });
      scratchDir = await realpath(
        await mkdtemp(join(SMOKE_SCRATCH_DIR, 'omd-detection-smoke-')),
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
      'stages a prompt-side moment from a real turn and proposes it in that turn injection',
      async () => {
        const turn: CommandInvocation = {
          command: 'devin',
          args: [
            '-p',
            DIRECTIVE_PROMPT,
            '--model',
            BENCH_MODEL,
            '--permission-mode',
            'dangerous',
            '--respect-workspace-trust',
            'false',
          ],
        };
        const answered: CommandResult = await runner.run(turn);
        expect(answered.exitCode, answered.stderr).toBe(0);

        const staged: readonly StagedCandidate[] =
          await readStagedCandidates(scratchDir);
        const detected: StagedCandidate | undefined = staged.find(
          (candidate: StagedCandidate): boolean =>
            candidate.principle.includes(
              'always run the migration check before deploying',
            ),
        );
        expect(
          detected,
          'the real prompt-submission payload carried the prompt detection reads',
        ).toBeDefined();
        expect(detected?.confirmingCommand).toContain("omd memory remember '");
        expect(
          detected?.deliveredAt,
          'the turn own injection carried the proposal once',
        ).not.toBeNull();
      },
      TURN_TIMEOUT_MS,
    );

    it('injects a knowledge entry the prompt triggers', async () => {
      const paths: MemoryStorePaths = new MemoryStorePaths(scratchDir);
      await mkdir(paths.dir, { recursive: true });
      await writeFile(
        paths.knowledge,
        `${JSON.stringify([DEPLOY_KNOWLEDGE], null, 2)}\n`,
        'utf8',
      );

      const matched: HookOutput = await runHook(scratchDir, 'user-prompt', {
        hook_event_name: 'UserPromptSubmit',
        session_id: 'omd-smoke-detection-session',
        prompt: 'can you deploy the service now',
      });
      const unmatched: HookOutput = await runHook(scratchDir, 'user-prompt', {
        hook_event_name: 'UserPromptSubmit',
        session_id: 'omd-smoke-detection-session',
        prompt: 'what does the readme say',
      });

      expect(matched.hookSpecificOutput?.additionalContext ?? '').toContain(
        DEPLOY_KNOWLEDGE.text,
      );
      expect(
        unmatched.hookSpecificOutput?.additionalContext ?? '',
      ).not.toContain(DEPLOY_KNOWLEDGE.text);
    });
  });
});
