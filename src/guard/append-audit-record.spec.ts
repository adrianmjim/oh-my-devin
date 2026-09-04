import { chmod, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enumerateRunRecords } from '../observability/enumerate-run-records';
import type { RunId } from '../observability/run-id';
import { appendAuditRecord } from './append-audit-record';
import type { AuditRecord } from './audit-record';
import { guardAuditPath } from './guard-audit-path';

function record(overrides: Partial<AuditRecord>): AuditRecord {
  return {
    timestamp: 1,
    tool: 'write',
    filePath: 'src/index.ts',
    decision: 'blocked',
    reason: 'the contract',
    enforcementLevel: 'strict',
    sessionId: 'session-a',
    ...overrides,
  };
}

describe('appendAuditRecord', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-guard-audit-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  async function readLines(): Promise<readonly string[]> {
    const raw: string = await readFile(guardAuditPath(baseDir), 'utf8');
    return raw.split('\n').filter((line: string): boolean => line !== '');
  }

  it('appends one camelCase JSONL record per decision', async () => {
    await appendAuditRecord(baseDir, record({}));

    const lines: readonly string[] = await readLines();

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? '')).toEqual({
      timestamp: 1,
      tool: 'write',
      filePath: 'src/index.ts',
      decision: 'blocked',
      reason: 'the contract',
      enforcementLevel: 'strict',
      sessionId: 'session-a',
    });
  });

  it('shares one file across concurrent sessions', async () => {
    await appendAuditRecord(baseDir, record({ sessionId: 'session-a' }));
    await appendAuditRecord(
      baseDir,
      record({ sessionId: 'session-b', decision: 'warned' }),
    );

    const lines: readonly string[] = await readLines();

    expect(lines).toHaveLength(2);
    expect(
      lines.map((line: string): unknown => JSON.parse(line)),
    ).toMatchObject([{ sessionId: 'session-a' }, { sessionId: 'session-b' }]);
  });

  it('records an unidentified session as a null field', async () => {
    await appendAuditRecord(baseDir, record({ sessionId: null }));

    expect(JSON.parse((await readLines())[0] ?? '')).toMatchObject({
      sessionId: null,
    });
  });

  it('leaves the run record enumeration seeing no run', async () => {
    await appendAuditRecord(baseDir, record({}));

    const runs: readonly RunId[] = await enumerateRunRecords(
      baseDir,
      1,
      60_000,
    );

    expect(runs).toEqual([]);
  });

  it('stays silent when the audit cannot be written', async () => {
    const auditDir: string = dirname(guardAuditPath(baseDir));
    await mkdir(auditDir, { recursive: true });
    await chmod(auditDir, 0o500);

    await expect(
      appendAuditRecord(baseDir, record({})),
    ).resolves.toBeUndefined();

    await chmod(auditDir, 0o700);
  });
});
