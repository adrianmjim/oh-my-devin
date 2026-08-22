import { isContractualSession } from '../detection/is-contractual-session';
import { readStagedRules } from '../detection/read-staged-rules';
import { stageMatchedRules } from '../detection/stage-matched-rules';
import type { StagedRule } from '../detection/staged-rule';
import { withDetectionStateLock } from '../detection/with-detection-state-lock';
import { writeStagedRules } from '../detection/write-staged-rules';
import { readRules } from '../memory/read-rules';
import type { RuleEntry } from '../memory/rule-entry';
import type { HookEvent } from './hook-event';
import { recordSessionSeen } from './record-session-seen';
import { stageSessionIdentity } from './stage-session-identity';

export async function handleToolUseEvent(
  baseDir: string,
  event: HookEvent,
  now: number,
  env: NodeJS.ProcessEnv,
): Promise<void> {
  if (event.sessionId !== null) {
    await recordSessionSeen(baseDir, event.sessionId, now);
    if (event.command !== null) {
      await stageSessionIdentity(baseDir, event.sessionId, event.command, now);
    }
  }
  if (event.path !== null && !isContractualSession(env)) {
    const rules: readonly RuleEntry[] = await readRules(baseDir);
    if (rules.length > 0) {
      const path: string = event.path;
      await withDetectionStateLock(baseDir, async (): Promise<void> => {
        const staged: readonly StagedRule[] = await readStagedRules(baseDir);
        await writeStagedRules(
          baseDir,
          stageMatchedRules(staged, rules, path, event.sessionId, now),
        );
      });
    }
  }
}
