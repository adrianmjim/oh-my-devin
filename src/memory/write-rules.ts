import { MemoryStorePaths } from './memory-store-paths';
import type { RuleEntry } from './rule-entry';
import { writeFileAtomically } from './write-file-atomically';

export async function writeRules(
  baseDir: string,
  entries: readonly RuleEntry[],
): Promise<void> {
  await writeFileAtomically(
    new MemoryStorePaths(baseDir).rules,
    `${JSON.stringify(entries, null, 2)}\n`,
  );
}
