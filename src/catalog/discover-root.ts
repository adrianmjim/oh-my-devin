import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { DiscoveryAccumulator } from './discovery-accumulator';
import { readDefinition } from './read-definition';
import { readDirectories } from './read-directories';

export async function discoverRoot(
  agentsDir: string,
  accumulator: DiscoveryAccumulator,
): Promise<void> {
  const directories: readonly Dirent[] = await readDirectories(agentsDir);
  for (const entry of directories) {
    const name: string = entry.name;
    if (!accumulator.seen.has(name)) {
      const content: string | null = await readDefinition(
        join(agentsDir, name, 'AGENT.md'),
      );
      if (content !== null) {
        accumulator.seen.add(name);
        try {
          accumulator.roles.push(parseRoleDefinition(content, name));
        } catch (error: unknown) {
          accumulator.errors.push({
            name,
            message: error instanceof Error ? error.message : 'parse error',
          });
        }
      }
    }
  }
}
