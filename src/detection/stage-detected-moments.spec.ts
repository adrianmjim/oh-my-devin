import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readStagedCandidates } from './read-staged-candidates';
import { readTranscriptCursors } from './read-transcript-cursors';
import type { StagedCandidate } from './staged-candidate';
import { stageDetectedMoments } from './stage-detected-moments';
import { SUPPORTED_TRANSCRIPT_SCHEMA_VERSION } from './supported-transcript-schema-version';

interface SeededMessage {
  readonly sessionId: string;
  readonly role: string;
  readonly content: string;
}

const DIRECTIVE: string = 'always run the migration check before deploying';
const ASSISTANT_DIRECTIVE: string =
  'never let the export endpoint page beyond a thousand rows';

describe('stageDetectedMoments', () => {
  let projectDir: string;
  let storeDir: string;
  let storePath: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-detect-'));
    storeDir = await mkdtemp(join(tmpdir(), 'omd-detect-store-'));
    storePath = join(storeDir, 'sessions.db');
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
    await rm(storeDir, { recursive: true, force: true });
  });

  function seed(
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

  async function principles(): Promise<readonly string[]> {
    return (await readStagedCandidates(projectDir)).map(
      (candidate: StagedCandidate): string => candidate.principle,
    );
  }

  it('stages a candidate the prompt carries', async () => {
    await stageDetectedMoments(projectDir, 'sess-1', DIRECTIVE, storePath, 100);

    expect(await principles()).toEqual([
      'In this project, always run the migration check before deploying.',
    ]);
  });

  it('stages the confirming invocation alongside the principle', async () => {
    await stageDetectedMoments(projectDir, 'sess-1', DIRECTIVE, storePath, 100);

    const staged: readonly StagedCandidate[] =
      await readStagedCandidates(projectDir);
    expect(staged[0]?.confirmingCommand).toBe(
      "omd memory remember 'In this project, always run the migration check before deploying.'",
    );
  });

  it('stages nothing for a prompt below the quality gate', async () => {
    await stageDetectedMoments(
      projectDir,
      'sess-1',
      'what does the readme say',
      storePath,
      100,
    );

    expect(await principles()).toEqual([]);
  });

  it('stages an assistant-side moment no hook payload carried', async () => {
    seed([
      { sessionId: 'sess-1', role: 'assistant', content: ASSISTANT_DIRECTIVE },
    ]);

    await stageDetectedMoments(projectDir, 'sess-1', 'thanks', storePath, 100);

    expect(await principles()).toEqual([
      'In this project, never let the export endpoint page beyond a thousand rows.',
    ]);
  });

  it('stages nothing out of another session transcript', async () => {
    seed([
      { sessionId: 'sess-2', role: 'assistant', content: ASSISTANT_DIRECTIVE },
    ]);

    await stageDetectedMoments(projectDir, 'sess-1', 'thanks', storePath, 100);

    expect(await principles()).toEqual([]);
  });

  it('advances the cursor so one transcript moment stages once', async () => {
    seed([
      { sessionId: 'sess-1', role: 'assistant', content: ASSISTANT_DIRECTIVE },
    ]);
    await stageDetectedMoments(projectDir, 'sess-1', 'thanks', storePath, 100);

    await stageDetectedMoments(
      projectDir,
      'sess-1',
      'thanks again',
      storePath,
      200,
    );

    expect(await principles()).toHaveLength(1);
    expect(await readTranscriptCursors(projectDir)).toEqual([
      { sessionId: 'sess-1', lastRowId: 1 },
    ]);
  });

  it('keeps detecting from the prompt when the store has drifted', async () => {
    seed(
      [
        {
          sessionId: 'sess-1',
          role: 'assistant',
          content: ASSISTANT_DIRECTIVE,
        },
      ],
      SUPPORTED_TRANSCRIPT_SCHEMA_VERSION + 1,
    );

    await stageDetectedMoments(projectDir, 'sess-1', DIRECTIVE, storePath, 100);

    expect(await principles()).toEqual([
      'In this project, always run the migration check before deploying.',
    ]);
    expect(await readTranscriptCursors(projectDir)).toEqual([]);
  });

  it('keeps detecting from the prompt when the store is unreadable', async () => {
    await writeFile(storePath, 'not a database at all', 'utf8');

    await stageDetectedMoments(projectDir, 'sess-1', DIRECTIVE, storePath, 100);

    expect(await principles()).toHaveLength(1);
  });

  it('detects from the prompt alone for an event naming no session', async () => {
    seed([
      { sessionId: 'sess-1', role: 'assistant', content: ASSISTANT_DIRECTIVE },
    ]);

    await stageDetectedMoments(projectDir, null, DIRECTIVE, storePath, 100);

    expect(await principles()).toEqual([
      'In this project, always run the migration check before deploying.',
    ]);
  });

  it('stages a moment only once however often the prompt repeats it', async () => {
    await stageDetectedMoments(projectDir, 'sess-1', DIRECTIVE, storePath, 100);

    await stageDetectedMoments(projectDir, 'sess-1', DIRECTIVE, storePath, 200);

    expect(await principles()).toHaveLength(1);
  });
});
