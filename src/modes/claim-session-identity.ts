import { enumerateSessions } from './enumerate-sessions';
import { isSessionStale } from './is-session-stale';
import { readStagedIdentities } from './read-staged-identities';
import type { SessionId } from './session-id';
import type { SessionRegistryEntry } from './session-registry-entry';
import type { StagedIdentity } from './staged-identity';
import { writeStagedIdentities } from './write-staged-identities';

export async function claimSessionIdentity(
  baseDir: string,
  invocation: string,
  now: number,
  thresholdMs: number,
): Promise<SessionId | null> {
  const sessions: readonly SessionRegistryEntry[] =
    await enumerateSessions(baseDir);
  const matches: StagedIdentity[] = [];
  for (const session of sessions) {
    if (!isSessionStale(session.lastSeenAt, now, thresholdMs)) {
      const staged: readonly StagedIdentity[] = await readStagedIdentities(
        baseDir,
        session.sessionId,
      );
      matches.push(
        ...staged.filter(
          (entry: StagedIdentity): boolean => entry.invocation === invocation,
        ),
      );
    }
  }
  const freshest: StagedIdentity | undefined = matches.reduce(
    (
      best: StagedIdentity | undefined,
      entry: StagedIdentity,
    ): StagedIdentity =>
      best === undefined || entry.stagedAt > best.stagedAt ? entry : best,
    undefined,
  );
  let claimed: SessionId | null = null;
  if (freshest !== undefined) {
    const held: readonly StagedIdentity[] = await readStagedIdentities(
      baseDir,
      freshest.sessionId,
    );
    const consumed: number = held.findIndex(
      (entry: StagedIdentity): boolean =>
        entry.invocation === freshest.invocation &&
        entry.stagedAt === freshest.stagedAt,
    );
    await writeStagedIdentities(
      baseDir,
      freshest.sessionId,
      held.filter(
        (_entry: StagedIdentity, index: number): boolean => index !== consumed,
      ),
    );
    claimed = freshest.sessionId;
  }
  return claimed;
}
