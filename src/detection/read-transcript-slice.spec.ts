import { chmodSync, readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readTranscriptSlice } from './read-transcript-slice';
import { SUPPORTED_TRANSCRIPT_SCHEMA_VERSION } from './supported-transcript-schema-version';
import type { TranscriptCursor } from './transcript-cursor';
import type { TranscriptMessage } from './transcript-message';
import type { TranscriptReadResult } from './transcript-read-result';
import { TRANSCRIPT_READ_BOUND } from './transcript-read-bound';

interface SeededMessage {
  readonly sessionId: string;
  readonly role: string;
  readonly content: string;
  readonly createdAt: number;
}

describe('readTranscriptSlice', () => {
  let storeDir: string;
  let storePath: string;

  beforeEach(async () => {
    storeDir = await mkdtemp(join(tmpdir(), 'omd-transcript-'));
    storePath = join(storeDir, 'sessions.db');
  });

  afterEach(async () => {
    chmodSync(storeDir, 0o755);
    await rm(storeDir, { recursive: true, force: true });
  });

  function seed(
    messages: readonly SeededMessage[],
    schemaVersion: number = SUPPORTED_TRANSCRIPT_SCHEMA_VERSION,
  ): void {
    const database: DatabaseSync = new DatabaseSync(storePath);
    database.exec('PRAGMA journal_mode=WAL');
    database.exec(
      'CREATE TABLE refinery_schema_history(version int4 PRIMARY KEY, name VARCHAR(255), applied_on VARCHAR(255), checksum VARCHAR(255))',
    );
    database.exec(
      'CREATE TABLE message_nodes (row_id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, node_id INTEGER NOT NULL, parent_node_id INTEGER, chat_message TEXT NOT NULL, created_at INTEGER NOT NULL, metadata TEXT)',
    );
    database
      .prepare('INSERT INTO refinery_schema_history(version, name) VALUES (?, ?)')
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
          message.createdAt,
        );
    }
    database.close();
  }

  function cursorFor(sessionId: string, lastRowId: number): TranscriptCursor {
    return { sessionId, lastRowId };
  }

  it('reads the session’s messages behind the boundary', () => {
    seed([
      { sessionId: 's1', role: 'user', content: 'why did that fail', createdAt: 10 },
      {
        sessionId: 's1',
        role: 'assistant',
        content: 'because the gate is manual',
        createdAt: 20,
      },
    ]);

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(result.reach).toBe('both-substrates');
    expect(
      result.messages.map((message: TranscriptMessage): string => message.text),
    ).toEqual(['why did that fail', 'because the gate is manual']);
  });

  it('reads only the session the pipe event belongs to', () => {
    seed([
      { sessionId: 's1', role: 'user', content: 'mine', createdAt: 10 },
      { sessionId: 's2', role: 'user', content: 'another session', createdAt: 20 },
    ]);

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(
      result.messages.map((message: TranscriptMessage): string => message.text),
    ).toEqual(['mine']);
  });

  it('advances its cursor and reads only what follows it', () => {
    seed([
      { sessionId: 's1', role: 'user', content: 'first', createdAt: 10 },
      { sessionId: 's1', role: 'assistant', content: 'second', createdAt: 20 },
    ]);

    const first: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );
    const second: TranscriptReadResult = readTranscriptSlice(
      storePath,
      first.cursor,
    );

    expect(first.cursor.lastRowId).toBeGreaterThan(0);
    expect(second.messages).toEqual([]);
    expect(second.cursor.lastRowId).toBe(first.cursor.lastRowId);
  });

  it('bounds the slice one invocation reads', () => {
    seed(
      Array.from(
        { length: TRANSCRIPT_READ_BOUND + 5 },
        (_unused: unknown, index: number): SeededMessage => ({
          sessionId: 's1',
          role: 'user',
          content: `message ${index}`,
          createdAt: index,
        }),
      ),
    );

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(result.messages).toHaveLength(TRANSCRIPT_READ_BOUND);
    expect(result.messages[0]?.text).toBe('message 0');
  });

  it('reads a store it holds no write access to', () => {
    seed([{ sessionId: 's1', role: 'user', content: 'held', createdAt: 10 }]);
    chmodSync(storePath, 0o444);

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(result.reach).toBe('both-substrates');
    expect(result.messages).toHaveLength(1);
  });

  it('leaves the engine’s store byte-identical', () => {
    seed([{ sessionId: 's1', role: 'user', content: 'held', createdAt: 10 }]);
    const before: Buffer = readFileSync(storePath);

    readTranscriptSlice(storePath, cursorFor('s1', 0));

    expect(readFileSync(storePath).equals(before)).toBe(true);
  });

  it('degrades to prompt-only when the store is absent', () => {
    const result: TranscriptReadResult = readTranscriptSlice(
      join(storeDir, 'missing.db'),
      cursorFor('s1', 0),
    );

    expect(result.reach).toBe('prompt-only');
    expect(result.messages).toEqual([]);
    expect(result.cursor).toEqual(cursorFor('s1', 0));
  });

  it('degrades to prompt-only when the store cannot be read', async () => {
    await writeFile(storePath, 'not a database at all', 'utf8');

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(result.reach).toBe('prompt-only');
    expect(result.messages).toEqual([]);
  });

  it('degrades to prompt-only when the schema has drifted', () => {
    seed(
      [{ sessionId: 's1', role: 'user', content: 'held', createdAt: 10 }],
      SUPPORTED_TRANSCRIPT_SCHEMA_VERSION + 1,
    );

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(result.reach).toBe('prompt-only');
    expect(result.messages).toEqual([]);
    expect(result.cursor).toEqual(cursorFor('s1', 0));
  });

  it('skips messages it cannot translate without failing the read', () => {
    seed([
      { sessionId: 's1', role: 'narrator', content: 'foreign', createdAt: 10 },
      { sessionId: 's1', role: 'user', content: 'mine', createdAt: 20 },
    ]);

    const result: TranscriptReadResult = readTranscriptSlice(
      storePath,
      cursorFor('s1', 0),
    );

    expect(result.reach).toBe('both-substrates');
    expect(
      result.messages.map((message: TranscriptMessage): string => message.text),
    ).toEqual(['mine']);
  });
});
