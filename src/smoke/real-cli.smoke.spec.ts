import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { DevinHeadlessEngine } from '../engine/devin-headless-engine';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import type { PromptTurn } from '../engine/prompt-turn';
import type { SessionListing } from '../engine/session-listing';
import type { RoleDefinition } from '../role/role-definition';

const smokeEnabled: boolean = process.env['OMD_SMOKE'] === '1';

const PINNED_DEVIN_VERSION: string = '3000.1.27';
const VERSION_PATTERN: RegExp = /(\d+\.\d+\.\d+)/;
const PROBE_TIMEOUT_MS: number = 120000;
const TURN_TIMEOUT_MS: number = 600000;

const PROBE_ROLE: RoleDefinition = {
  name: 'omd-smoke-probe',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: [],
  permissions: { allow: [], deny: [], ask: [] },
  outputArtifact: 'probe.json',
  outputSchema: 'probe.schema.json',
  maxTurns: 1,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'You are a smoke probe. Follow the task exactly.',
};

describe.runIf(smokeEnabled)('real Devin CLI smoke suite', () => {
  const engine: DevinHeadlessEngine = new DevinHeadlessEngine();
  let scratchDir: string;
  let runner: ProcessCommandRunner;
  let agentConfigPath: string;

  function turnInvocation(
    prompt: string,
    resumeSessionId: string | null,
  ): CommandInvocation {
    const turn: PromptTurn = {
      prompt,
      agentConfigPath,
      model: null,
      resumeSessionId,
    };
    return engine.turnInvocation(turn);
  }

  async function listSessions(): Promise<readonly SessionListing[]> {
    const result: CommandResult = await runner.run(engine.listInvocation());
    expect(result.exitCode, result.stderr).toBe(0);
    return engine.parseSessionListing(result.stdout);
  }

  beforeAll(async () => {
    scratchDir = await realpath(await mkdtemp(join(tmpdir(), 'omd-smoke-')));
    runner = new ProcessCommandRunner(scratchDir);
    const bundle: AgentConfigBundle = compileAgentConfigBundle(PROBE_ROLE);
    agentConfigPath = join(scratchDir, 'agent-config.json');
    await writeFile(agentConfigPath, JSON.stringify(bundle), 'utf8');
  });

  afterAll(async () => {
    await rm(scratchDir, { recursive: true, force: true });
  });

  it('runs only when OMD_SMOKE=1 is set', () => {
    expect(smokeEnabled).toBe(true);
  });

  it(
    'reports a version from devin --version',
    async () => {
      const result: CommandResult = await runner.run({
        command: 'devin',
        args: ['--version'],
      });
      expect(result.exitCode, result.stderr).toBe(0);
      expect(result.stdout.trim()).not.toBe('');
      const detected: string | null =
        VERSION_PATTERN.exec(result.stdout)?.[1] ?? null;
      if (detected !== PINNED_DEVIN_VERSION) {
        console.warn(
          `devin version ${detected ?? 'unknown'} drifts from pinned ${PINNED_DEVIN_VERSION}`,
        );
      }
    },
    PROBE_TIMEOUT_MS,
  );

  it(
    'completes a single headless turn with exit 0',
    async () => {
      const invocation: CommandInvocation = turnInvocation(
        'Reply with the single word ok. Do not use any tools and do not modify any files.',
        null,
      );
      const result: CommandResult = await runner.run(invocation);
      expect(result.exitCode, result.stderr).toBe(0);
    },
    TURN_TIMEOUT_MS,
  );

  it(
    'lists sessions as JSON parseable by the engine',
    async () => {
      const sessions: readonly SessionListing[] = await listSessions();
      for (const session of sessions) {
        expect(session.id).not.toBe('');
      }
    },
    PROBE_TIMEOUT_MS,
  );

  it(
    'resumes the scratch-directory session for a second turn',
    async () => {
      const sessions: readonly SessionListing[] = await listSessions();
      const match: SessionListing | undefined = sessions.find(
        (session: SessionListing): boolean =>
          session.workingDirectory === scratchDir,
      );
      expect(match).toBeDefined();
      const invocation: CommandInvocation = turnInvocation(
        'Reply with the single word ok again. Do not use any tools and do not modify any files.',
        match?.id ?? null,
      );
      expect(invocation.args.slice(0, 2)).toEqual(['--resume', match?.id]);
      const result: CommandResult = await runner.run(invocation);
      expect(result.exitCode, result.stderr).toBe(0);
    },
    TURN_TIMEOUT_MS,
  );
});
