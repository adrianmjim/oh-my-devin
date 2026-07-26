import { readFile } from 'node:fs/promises';
import type { RoleCandidate } from './role-candidate';

export async function readCandidate(
  candidate: RoleCandidate,
): Promise<string | null> {
  let content: string | null;
  try {
    content = await readFile(candidate.definitionPath, 'utf8');
  } catch {
    content = null;
  }
  return content;
}
