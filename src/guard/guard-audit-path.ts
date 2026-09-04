import { join } from 'node:path';

export function guardAuditPath(baseDir: string): string {
  return join(baseDir, '.omd', 'runs', 'guard-audit.jsonl');
}
