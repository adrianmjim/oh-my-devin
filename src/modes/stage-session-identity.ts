import { modeInvocationOf } from './mode-invocation-of';
import { readStagedIdentities } from './read-staged-identities';
import type { SessionId } from './session-id';
import type { StagedIdentity } from './staged-identity';
import { writeStagedIdentities } from './write-staged-identities';

export async function stageSessionIdentity(
  baseDir: string,
  sessionId: SessionId,
  command: string,
  stagedAt: number,
): Promise<void> {
  const invocation: string | null = modeInvocationOf(command);
  if (invocation !== null) {
    const held: readonly StagedIdentity[] = await readStagedIdentities(
      baseDir,
      sessionId,
    );
    await writeStagedIdentities(baseDir, sessionId, [
      ...held,
      { sessionId, invocation, stagedAt },
    ]);
  }
}
