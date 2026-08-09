import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { CommandResult } from '../engine/command-result';
import { contentHash } from '../memory/content-hash';
import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import type { RuleEntry } from '../memory/rule-entry';
import { createE2eProject } from '../testing/create-e2e-project';
import type { DevinStubScript } from '../testing/devin-stub-script';
import type { E2eProject } from '../testing/e2e-project';
import { SUPPORTED_TRANSCRIPT_SCHEMA_VERSION } from './supported-transcript-schema-version';

interface HookSpecificOutput {
  readonly additionalContext?: string;
}

interface HookOutput {
  readonly hookSpecificOutput?: HookSpecificOutput;
}

interface SeededMessage {
  readonly sessionId: string;
  readonly role: string;
  readonly content: string;
}

const PERMISSIVE_SCHEMA: string = JSON.stringify({ type: 'object' });

const DIRECTIVE: string = 'always run the migration check before deploying';
const PRINCIPLE: string =
  'In this project, always run the migration check before deploying.';

const DEPLOY_KNOWLEDGE: KnowledgeEntry = {
  text: 'the deploy gate is manual',
  triggers: ['deploy'],
  hash: contentHash('the deploy gate is manual'),
  recordedAt: 10,
};

const EXPORT_RULE: RuleEntry = {
  text: 'export endpoints stay paginated',
  globs: ['src/api/**'],
  hash: contentHash('export endpoints stay paginated'),
  recordedAt: 10,
};

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

const ONE_TURN: DevinStubScript = {
  turns: [turn('done')],
  listResponse: turn('[]'),
};

function reviewerAgentMd(): string {
  return [
    '---',
    'omd-output: review.json',
    'omd-schema: .devin/schemas/review.schema.json',
    'omd-max-turns: 3',
    'omd-memory:',
    '  - knowledge',
    '---',
    'You are the reviewer.',
    '',
  ].join('\n');
}

async function writeIn(
  dir: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const absolute: string = join(dir, relativePath);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}

describe('omd memory detection (e2e)', () => {
  let project: E2eProject | null = null;
  let storeDir: string;
  let storePath: string;

  beforeEach(async () => {
    storeDir = await mkdtemp(join(tmpdir(), 'omd-e2e-transcript-'));
    storePath = join(storeDir, 'sessions.db');
  });

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
    await rm(storeDir, { recursive: true, force: true });
  });

  function seedTranscript(
    messages: readonly SeededMessage[],
    schemaVersion: number = SUPPORTED_TRANSCRIPT_SCHEMA_VERSION,
  ): void {
    const database: DatabaseSync = new DatabaseSync(storePath);
    database.exec(
      'CREATE TABLE refinery_schema_history(version int4 PRIMARY KEY, name VARCHAR(255))',
    );
    database.exec(
      'CREATE TABLE message_nodes (row_id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, node_id INTEGER NOT NULL, chat_message TEXT NOT NULL, created_at INTEGER NOT NULL)',
    );
    database
      .prepare(
        'INSERT INTO refinery_schema_history(version, name) VALUES (?, ?)',
      )
      .run(schemaVersion, 'seeded');
    let nodeId: number = 0;
    for (const message of messages) {
      nodeId = nodeId + 1;
      database
        .prepare(
          'INSERT INTO message_nodes(session_id, node_id, chat_message, created_at) VALUES (?, ?, ?, ?)',
        )
        .run(
          message.sessionId,
          nodeId,
          JSON.stringify({ role: message.role, content: message.content }),
          nodeId,
        );
    }
    database.close();
  }

  function runHook(
    started: E2eProject,
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
          [join(started.dir, '.devin', 'hooks', 'omd-mode.mjs'), phase],
          {
            cwd: started.dir,
            env: {
              ...process.env,
              PATH: `${started.binDir}${delimiter}${process.env['PATH'] ?? ''}`,
              CHISEL_SESSION_DB: storePath,
            },
          },
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
          if (code !== 0) {
            reject(
              new Error(
                `hook ${phase} exited ${String(code)}: ${stderr || stdout}`,
              ),
            );
          } else {
            try {
              resolvePromise(JSON.parse(stdout) as HookOutput);
            } catch {
              reject(
                new Error(`hook ${phase} answered no JSON: ${stdout}${stderr}`),
              );
            }
          }
        });
        child.stdin.write(JSON.stringify(event));
        child.stdin.end();
      },
    );
  }

  async function injectionFor(
    started: E2eProject,
    prompt: string,
    sessionId: string = 'sess-1',
  ): Promise<string> {
    const output: HookOutput = await runHook(started, 'user-prompt', {
      hook_event_name: 'UserPromptSubmit',
      session_id: sessionId,
      prompt,
    });
    return output.hookSpecificOutput?.additionalContext ?? '';
  }

  async function touch(started: E2eProject, path: string): Promise<void> {
    await runHook(started, 'tool-use', {
      hook_event_name: 'PreToolUse',
      session_id: 'sess-1',
      tool_input: { file_path: path },
    });
  }

  async function startProject(): Promise<E2eProject> {
    const started: E2eProject = await createE2eProject();
    project = started;
    await started.run(['setup']);
    return started;
  }

  it('proposes a detected moment and the verb confirms it into the store', async () => {
    const started: E2eProject = await startProject();

    const injected: string = await injectionFor(started, DIRECTIVE);

    expect(injected).toContain(PRINCIPLE);
    expect(injected).toContain(`omd memory remember '${PRINCIPLE}'`);
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await expect(readFile(paths.notepad, 'utf8')).rejects.toThrow();

    const confirmed: CommandResult = await started.run([
      'memory',
      'remember',
      PRINCIPLE,
    ]);

    expect(confirmed.exitCode).toBe(0);
    expect(await readFile(paths.notepad, 'utf8')).toContain(PRINCIPLE);
  });

  it('proposes an assistant-side moment the transcript alone carried', async () => {
    seedTranscript([
      {
        sessionId: 'sess-1',
        role: 'assistant',
        content: 'never let the export endpoint page beyond a thousand rows',
      },
    ]);
    const started: E2eProject = await startProject();

    const injected: string = await injectionFor(started, 'thanks');

    expect(injected).toContain(
      'In this project, never let the export endpoint page beyond a thousand rows.',
    );
  });

  it('proposes nothing from a drifted store and keeps detecting the prompt', async () => {
    seedTranscript(
      [
        {
          sessionId: 'sess-1',
          role: 'assistant',
          content: 'never let the export endpoint page beyond a thousand rows',
        },
      ],
      SUPPORTED_TRANSCRIPT_SCHEMA_VERSION + 1,
    );
    const started: E2eProject = await startProject();

    const injected: string = await injectionFor(started, DIRECTIVE);

    expect(injected).not.toContain('export endpoint');
    expect(injected).toContain(PRINCIPLE);
  });

  it('fires a knowledge entry ambiently on a matching prompt only', async () => {
    const started: E2eProject = await startProject();
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(
      paths.knowledge,
      JSON.stringify([DEPLOY_KNOWLEDGE]),
      'utf8',
    );

    const matched: string = await injectionFor(
      started,
      'can you deploy the api',
    );
    const unmatched: string = await injectionFor(
      started,
      'what is in the readme',
    );

    expect(matched).toContain(DEPLOY_KNOWLEDGE.text);
    expect(unmatched).not.toContain(DEPLOY_KNOWLEDGE.text);
  });

  it('fires a knowledge entry contractually for a declaring role', async () => {
    const started: E2eProject = await startProject();
    await writeIn(
      started.dir,
      join('.devin', 'agents', 'reviewer', 'AGENT.md'),
      reviewerAgentMd(),
    );
    await writeIn(
      started.dir,
      join('.devin', 'schemas', 'review.schema.json'),
      PERMISSIVE_SCHEMA,
    );
    await writeIn(started.dir, 'review.json', '{}');
    await started.writeScript(ONE_TURN);
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(
      paths.knowledge,
      JSON.stringify([DEPLOY_KNOWLEDGE]),
      'utf8',
    );

    const result: CommandResult = await started.run([
      'run',
      'reviewer',
      'review the deploy pipeline',
    ]);

    expect(result.exitCode, result.stdout + result.stderr).toBe(0);
    const bundles: readonly AgentConfigBundle[] =
      await started.readHandedBundles();
    expect(bundles[0]?.system_instructions[0]).toContain(DEPLOY_KNOWLEDGE.text);
  });

  it('stages a rule on a matching write and delivers it once', async () => {
    const started: E2eProject = await startProject();
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.rules, JSON.stringify([EXPORT_RULE]), 'utf8');

    await touch(started, 'src/api/export-endpoint.ts');
    const first: string = await injectionFor(started, 'carry on');
    const second: string = await injectionFor(started, 'carry on');

    expect(first).toContain(EXPORT_RULE.text);
    expect(second).not.toContain(EXPORT_RULE.text);
  });

  it('stages no rule for a write matching no glob', async () => {
    const started: E2eProject = await startProject();
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.rules, JSON.stringify([EXPORT_RULE]), 'utf8');

    await touch(started, 'docs/readme.md');

    expect(await injectionFor(started, 'carry on')).not.toContain(
      EXPORT_RULE.text,
    );
  });

  it('defers a staged rule past a session-start injection', async () => {
    const started: E2eProject = await startProject();
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.rules, JSON.stringify([EXPORT_RULE]), 'utf8');
    await touch(started, 'src/api/export-endpoint.ts');

    const atStart: HookOutput = await runHook(started, 'session-start', {
      hook_event_name: 'SessionStart',
      session_id: 'sess-1',
    });
    const atPrompt: string = await injectionFor(started, 'carry on');

    expect(atStart.hookSpecificOutput?.additionalContext ?? '').not.toContain(
      EXPORT_RULE.text,
    );
    expect(atPrompt).toContain(EXPORT_RULE.text);
  });

  it('delivers a staged rule only to the session that staged it', async () => {
    const started: E2eProject = await startProject();
    const paths: MemoryStorePaths = new MemoryStorePaths(started.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.rules, JSON.stringify([EXPORT_RULE]), 'utf8');
    await touch(started, 'src/api/export-endpoint.ts');

    const other: string = await injectionFor(started, 'carry on', 'sess-2');
    const own: string = await injectionFor(started, 'carry on');

    expect(other).not.toContain(EXPORT_RULE.text);
    expect(own).toContain(EXPORT_RULE.text);
  });
});
