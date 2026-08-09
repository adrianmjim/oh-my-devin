import type { HookEvent } from '../modes/hook-event';
import { appendAuditRecord } from './append-audit-record';
import { decideGuardOutcome } from './decide-guard-outcome';
import type { EnforcementLevel } from './enforcement-level';
import { guardMessage } from './guard-message';
import type { GuardOutcome } from './guard-outcome';
import { isContractualSession } from './is-contractual-session';
import { isLayerPath } from './is-layer-path';
import { isWriteTool } from './is-write-tool';
import type { PendingNotice } from './pending-notice';
import { readPendingNotices } from './read-pending-notices';
import { resolveEffectiveLevel } from './resolve-effective-level';
import { writePendingNotices } from './write-pending-notices';

export async function applyWriteGuard(
  baseDir: string,
  cwd: string,
  userConfigFile: string,
  event: HookEvent,
  now: number,
): Promise<Record<string, unknown>> {
  const tool: string | null = event.tool;
  const target: string | null = event.filePath;
  let output: Record<string, unknown> = {};
  if (
    tool !== null &&
    target !== null &&
    isWriteTool(tool) &&
    !(await isContractualSession(baseDir, event.sessionId, cwd, now))
  ) {
    const level: EnforcementLevel = await resolveEffectiveLevel(
      baseDir,
      userConfigFile,
      event.sessionId,
    );
    const outcome: GuardOutcome | null = decideGuardOutcome({
      level,
      outOfScope: !isLayerPath(baseDir, target),
      tool,
      filePath: target,
      reason: guardMessage(target),
      at: now,
    });
    if (outcome !== null) {
      await appendAuditRecord(baseDir, {
        timestamp: now,
        tool,
        filePath: target,
        decision: outcome.decision,
        reason: outcome.reason,
        enforcementLevel: level,
        sessionId: event.sessionId,
      });
      const notice: PendingNotice | null = outcome.notice;
      if (notice !== null && event.sessionId !== null) {
        const queued: readonly PendingNotice[] = await readPendingNotices(
          baseDir,
          event.sessionId,
        );
        await writePendingNotices(baseDir, event.sessionId, [
          ...queued,
          notice,
        ]);
      }
      output = outcome.output;
    }
  }
  return output;
}
