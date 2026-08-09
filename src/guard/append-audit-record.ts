import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { AuditRecord } from './audit-record';
import { guardAuditPath } from './guard-audit-path';

export async function appendAuditRecord(
  baseDir: string,
  record: AuditRecord,
): Promise<void> {
  const path: string = guardAuditPath(baseDir);
  await mkdir(dirname(path), { recursive: true }).catch((): void => undefined);
  await appendFile(path, `${JSON.stringify(record)}\n`, 'utf8').catch(
    (): void => undefined,
  );
}
