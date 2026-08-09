import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DetectionStatePaths } from '../detection/detection-state-paths';
import { readStagedRules } from '../detection/read-staged-rules';
import type { StagedRule } from '../detection/staged-rule';
import { contentHash } from '../memory/content-hash';
import type { RuleEntry } from '../memory/rule-entry';
import { writeRules } from '../memory/write-rules';
import { RUN_ID_ENV } from '../observability/run-id-env';
import { handleToolUseEvent } from './handle-tool-use-event';
import type { HookEvent } from './hook-event';
import { readSessionSeen } from './read-session-seen';
import { readStagedIdentities } from './read-staged-identities';

function event(fields: Partial<HookEvent>): HookEvent {
  return {
    sessionId: 'sess-1',
    command: null,
    path: null,
    prompt: null,
    ...fields,
  };
}

const EXPORT_RULE: RuleEntry = {
  text: 'export endpoints stay paginated',
  globs: ['src/api/**'],
  hash: contentHash('export endpoints stay paginated'),
  recordedAt: 10,
};

describe('handleToolUseEvent', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-tool-use-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('refreshes the session registry from the piped event', async () => {
    await handleToolUseEvent(projectDir, event({ command: 'ls -la' }), 500, {});

    expect(await readSessionSeen(projectDir, 'sess-1')).toEqual({
      sessionId: 'sess-1',
      lastSeenAt: 500,
    });
  });

  it('stages the identity of a mode invocation', async () => {
    await handleToolUseEvent(
      projectDir,
      event({ command: 'omd mode set plan' }),
      500,
      {},
    );

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([
      { sessionId: 'sess-1', invocation: 'mode set plan', stagedAt: 500 },
    ]);
  });

  it('stages nothing for a command that is not a mode invocation', async () => {
    await handleToolUseEvent(projectDir, event({ command: 'ls -la' }), 500, {});

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('records nothing for an event carrying no session', async () => {
    await handleToolUseEvent(
      projectDir,
      event({ sessionId: null, command: 'omd mode set plan' }),
      500,
      {},
    );

    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('tolerates an event carrying no command', async () => {
    await handleToolUseEvent(projectDir, event({}), 500, {});

    expect(await readSessionSeen(projectDir, 'sess-1')).not.toBeNull();
  });

  it('stages the rule a touched path matches', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);

    await handleToolUseEvent(
      projectDir,
      event({ path: 'src/api/export-endpoint.ts' }),
      500,
      {},
    );

    expect(await readStagedRules(projectDir)).toEqual([
      {
        text: EXPORT_RULE.text,
        hash: EXPORT_RULE.hash,
        sessionId: 'sess-1',
        stagedAt: 500,
        deliveredAt: null,
      },
    ]);
  });

  it('stages no rule the touched path matches nothing of', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);

    await handleToolUseEvent(
      projectDir,
      event({ path: 'docs/readme.md' }),
      500,
      {},
    );

    expect(await readStagedRules(projectDir)).toEqual([]);
  });

  it('stages no rule for a contractual session', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);

    await handleToolUseEvent(
      projectDir,
      event({ path: 'src/api/export-endpoint.ts' }),
      500,
      { [RUN_ID_ENV]: 'run-1' },
    );

    expect(await readStagedRules(projectDir)).toEqual([]);
    await expect(
      stat(new DetectionStatePaths(projectDir).rules),
    ).rejects.toThrow();
  });

  it('leaves a rule staged by an earlier event alone', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);
    await handleToolUseEvent(
      projectDir,
      event({ path: 'src/api/export-endpoint.ts' }),
      500,
      {},
    );

    await handleToolUseEvent(
      projectDir,
      event({ path: 'docs/readme.md' }),
      600,
      {},
    );

    const staged: readonly StagedRule[] = await readStagedRules(projectDir);
    expect(staged).toHaveLength(1);
    expect(staged[0]?.stagedAt).toBe(500);
  });

  it('stages nothing when the store holds no rule', async () => {
    await handleToolUseEvent(
      projectDir,
      event({ path: 'src/api/export-endpoint.ts' }),
      500,
      {},
    );

    expect(await readStagedRules(projectDir)).toEqual([]);
  });
});
