import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AmbientQuery } from '../detection/ambient-query';
import { stageCandidate } from '../detection/stage-candidate';
import { writeStagedCandidates } from '../detection/write-staged-candidates';
import { writeStagedRules } from '../detection/write-staged-rules';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import { contentHash } from '../memory/content-hash';
import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { writeKnowledge } from '../memory/write-knowledge';
import { writeProfile } from '../memory/write-profile';
import { deriveAmbientContext } from './derive-ambient-context';
import { recordSessionSeen } from './record-session-seen';
import { setSessionMode } from './set-session-mode';
import { stageSessionIdentity } from './stage-session-identity';

const DEPLOY: KnowledgeEntry = {
  text: 'the deploy gate is manual',
  triggers: ['deploy'],
  hash: contentHash('the deploy gate is manual'),
  recordedAt: 10,
};

function query(
  prompt: string,
  sessionId: string | null = 'sess-1',
): AmbientQuery {
  return { sessionId, prompt, phase: 'prompt-submission' };
}

describe('deriveAmbientContext', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-ambient-context-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('announces the layer in a project with nothing to inject', async () => {
    const context: string = await deriveAmbientContext(
      projectDir,
      query(''),
      100,
    );

    expect(context).toBe('Oh My Devin layer active.');
  });

  it('carries the session own active mode', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 100);
    await stageSessionIdentity(projectDir, 'sess-1', 'omd mode set plan', 100);
    await setSessionMode(projectDir, 'plan', null, 'mode set plan', 101);

    const context: string = await deriveAmbientContext(
      projectDir,
      query(''),
      110,
    );

    expect(context).toContain('plan mode active');
  });

  it('carries the notepad priority entries', async () => {
    await appendNotepadEntry(projectDir, 'priority', 'gate on staging', 10);

    const context: string = await deriveAmbientContext(
      projectDir,
      query(''),
      110,
    );

    expect(context).toContain('gate on staging');
  });

  it('carries the knowledge the prompt triggers', async () => {
    await writeKnowledge(projectDir, [DEPLOY]);

    const context: string = await deriveAmbientContext(
      projectDir,
      query('can you deploy the api tonight'),
      110,
    );

    expect(context).toContain('the deploy gate is manual');
  });

  it('carries no knowledge an unmatched prompt triggers nothing of', async () => {
    await writeKnowledge(projectDir, [DEPLOY]);

    const context: string = await deriveAmbientContext(
      projectDir,
      query('what does the readme say'),
      110,
    );

    expect(context).not.toContain('the deploy gate is manual');
  });

  it('carries a staged proposal with the command confirming it', async () => {
    await writeStagedCandidates(projectDir, [
      stageCandidate(
        { principle: 'In this project, always tag.', score: 0.7 },
        'sess-1',
        50,
      ),
    ]);

    const context: string = await deriveAmbientContext(
      projectDir,
      query(''),
      110,
    );

    expect(context).toContain(
      "omd memory remember 'In this project, always tag.'",
    );
  });

  it('carries a staged rule once', async () => {
    await writeStagedRules(projectDir, [
      {
        text: 'export endpoints stay paginated',
        hash: contentHash('export endpoints stay paginated'),
        sessionId: 'sess-1',
        stagedAt: 50,
        deliveredAt: null,
      },
    ]);
    const first: string = await deriveAmbientContext(
      projectDir,
      query(''),
      110,
    );

    const second: string = await deriveAmbientContext(
      projectDir,
      query(''),
      120,
    );

    expect(first).toContain('export endpoints stay paginated');
    expect(second).not.toContain('export endpoints stay paginated');
  });

  it('defers staged content at a session-start injection', async () => {
    await writeStagedRules(projectDir, [
      {
        text: 'export endpoints stay paginated',
        hash: contentHash('export endpoints stay paginated'),
        sessionId: 'sess-1',
        stagedAt: 50,
        deliveredAt: null,
      },
    ]);

    const atStart: string = await deriveAmbientContext(
      projectDir,
      { sessionId: 'sess-1', prompt: '', phase: 'session-start' },
      110,
    );

    const atPrompt: string = await deriveAmbientContext(
      projectDir,
      query(''),
      120,
    );

    expect(atStart).not.toContain('export endpoints stay paginated');
    expect(atPrompt).toContain('export endpoints stay paginated');
  });

  it('carries no profile content', async () => {
    await writeProfile(projectDir, {
      stack: ['typescript'],
      layout: ['src'],
      entryCommands: ['pnpm test'],
      derivedAt: 10,
    });

    expect(await deriveAmbientContext(projectDir, query(''), 110)).toBe(
      'Oh My Devin layer active.',
    );
  });

  it('carries no other session modes', async () => {
    await recordSessionSeen(projectDir, 'sess-2', 100);
    await stageSessionIdentity(projectDir, 'sess-2', 'omd mode set team', 100);
    await setSessionMode(projectDir, 'team', null, 'mode set team', 101);

    const context: string = await deriveAmbientContext(
      projectDir,
      query(''),
      110,
    );

    expect(context).not.toContain('team mode active');
  });

  it('degrades to the announcement when no session owns the event', async () => {
    expect(await deriveAmbientContext(projectDir, query('', null), 100)).toBe(
      'Oh My Devin layer active.',
    );
  });
});
