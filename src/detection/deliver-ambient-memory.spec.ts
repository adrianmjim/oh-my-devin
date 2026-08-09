import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import { AMBIENT_KNOWLEDGE_ENTRY_CAP } from '../memory/ambient-knowledge-entry-cap';
import { contentHash } from '../memory/content-hash';
import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import type { RuleEntry } from '../memory/rule-entry';
import { writeKnowledge } from '../memory/write-knowledge';
import { writeProfile } from '../memory/write-profile';
import { writeRules } from '../memory/write-rules';
import { AMBIENT_PROPOSAL_CAP } from './ambient-proposal-cap';
import type { AmbientQuery } from './ambient-query';
import { deliverAmbientMemory } from './deliver-ambient-memory';
import { stageCandidate } from './stage-candidate';
import type { StagedCandidate } from './staged-candidate';
import type { StagedRule } from './staged-rule';
import { writeStagedCandidates } from './write-staged-candidates';
import { writeStagedRules } from './write-staged-rules';

const DEPLOY: KnowledgeEntry = {
  text: 'the deploy gate is manual',
  triggers: ['deploy'],
  hash: contentHash('the deploy gate is manual'),
  recordedAt: 10,
};
const MIGRATION: KnowledgeEntry = {
  text: 'migrations run forward only',
  triggers: ['migration'],
  hash: contentHash('migrations run forward only'),
  recordedAt: 10,
};
const EXPORT_RULE: RuleEntry = {
  text: 'export endpoints stay paginated',
  globs: ['src/api/**'],
  hash: contentHash('export endpoints stay paginated'),
  recordedAt: 10,
};

function stagedRule(
  rule: RuleEntry,
  sessionId: string | null = 'sess-1',
): StagedRule {
  return {
    text: rule.text,
    hash: rule.hash,
    sessionId,
    stagedAt: 50,
    deliveredAt: null,
  };
}

function query(prompt: string): AmbientQuery {
  return { sessionId: 'sess-1', prompt, phase: 'prompt-submission' };
}

describe('deliverAmbientMemory', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-ambient-memory-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('carries nothing where the project holds no memory', async () => {
    expect(
      await deliverAmbientMemory(projectDir, query('deploy the api'), 100),
    ).toBe('');
  });

  it('carries the notepad priority entries', async () => {
    await appendNotepadEntry(projectDir, 'priority', 'gate on staging', 10);

    expect(
      await deliverAmbientMemory(projectDir, query('anything'), 100),
    ).toContain('gate on staging');
  });

  it('carries no working or manual notepad entry', async () => {
    await appendNotepadEntry(projectDir, 'working', 'a working note', 10);
    await appendNotepadEntry(projectDir, 'manual', 'a manual note', 11);

    const carried: string = await deliverAmbientMemory(
      projectDir,
      query('anything'),
      100,
    );

    expect(carried).toBe('');
  });

  it('carries the knowledge the prompt triggers', async () => {
    await writeKnowledge(projectDir, [DEPLOY, MIGRATION]);

    const carried: string = await deliverAmbientMemory(
      projectDir,
      query('can you deploy the api tonight'),
      100,
    );

    expect(carried).toContain('the deploy gate is manual');
    expect(carried).not.toContain('migrations run forward only');
  });

  it('carries no knowledge an unmatched prompt triggers nothing of', async () => {
    await writeKnowledge(projectDir, [DEPLOY]);

    expect(
      await deliverAmbientMemory(
        projectDir,
        query('what does the readme say'),
        100,
      ),
    ).toBe('');
  });

  it('bounds the knowledge one injection carries', async () => {
    await writeKnowledge(
      projectDir,
      Array.from(
        { length: AMBIENT_KNOWLEDGE_ENTRY_CAP + 2 },
        (_unused: unknown, index: number): KnowledgeEntry => ({
          text: `fact ${index}`,
          triggers: ['deploy'],
          hash: contentHash(`fact ${index}`),
          recordedAt: index,
        }),
      ),
    );

    const carried: string = await deliverAmbientMemory(
      projectDir,
      query('deploy now'),
      100,
    );

    expect(
      carried
        .split('\n')
        .filter((line: string): boolean => line.startsWith('- fact ')),
    ).toHaveLength(AMBIENT_KNOWLEDGE_ENTRY_CAP);
  });

  it('carries a staged proposal with the command confirming it', async () => {
    await writeStagedCandidates(projectDir, [
      stageCandidate(
        { principle: 'In this project, always tag.', score: 0.7 },
        'sess-1',
        50,
      ),
    ]);

    const carried: string = await deliverAmbientMemory(
      projectDir,
      query('anything'),
      100,
    );

    expect(carried).toContain('In this project, always tag.');
    expect(carried).toContain(
      "omd memory remember 'In this project, always tag.'",
    );
  });

  it('bounds the proposals one injection carries', async () => {
    await writeStagedCandidates(
      projectDir,
      Array.from(
        { length: AMBIENT_PROPOSAL_CAP + 2 },
        (_unused: unknown, index: number): StagedCandidate =>
          stageCandidate(
            { principle: `In this project, rule ${index}.`, score: 0.7 },
            'sess-1',
            50,
          ),
      ),
    );

    const carried: string = await deliverAmbientMemory(
      projectDir,
      query('anything'),
      100,
    );

    expect(
      carried
        .split('\n')
        .filter((line: string): boolean =>
          line.startsWith('- In this project, rule '),
        ),
    ).toHaveLength(AMBIENT_PROPOSAL_CAP);
  });

  it('carries a staged rule', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);
    await writeStagedRules(projectDir, [stagedRule(EXPORT_RULE)]);

    expect(
      await deliverAmbientMemory(projectDir, query('anything'), 100),
    ).toContain('export endpoints stay paginated');
  });

  it('carries no repeat of a rule an earlier injection delivered', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);
    await writeStagedRules(projectDir, [stagedRule(EXPORT_RULE)]);
    await deliverAmbientMemory(projectDir, query('anything'), 100);

    expect(await deliverAmbientMemory(projectDir, query('anything'), 200)).toBe(
      '',
    );
  });

  it('carries no repeat of a proposal an earlier injection delivered', async () => {
    await writeStagedCandidates(projectDir, [
      stageCandidate(
        { principle: 'In this project, always tag.', score: 0.7 },
        'sess-1',
        50,
      ),
    ]);
    await deliverAmbientMemory(projectDir, query('anything'), 100);

    expect(await deliverAmbientMemory(projectDir, query('anything'), 200)).toBe(
      '',
    );
  });

  it('leaves staged content for another session pending and unmarked', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);
    await writeStagedRules(projectDir, [stagedRule(EXPORT_RULE, 'sess-other')]);

    const carried: string = await deliverAmbientMemory(
      projectDir,
      query('anything'),
      100,
    );

    expect(carried).toBe('');
    expect(
      await deliverAmbientMemory(
        projectDir,
        {
          sessionId: 'sess-other',
          prompt: 'anything',
          phase: 'prompt-submission',
        },
        200,
      ),
    ).toContain('export endpoints stay paginated');
  });

  it('defers staged content past a session-start injection', async () => {
    await writeRules(projectDir, [EXPORT_RULE]);
    await writeStagedRules(projectDir, [stagedRule(EXPORT_RULE)]);
    await writeStagedCandidates(projectDir, [
      stageCandidate(
        { principle: 'In this project, always tag.', score: 0.7 },
        'sess-1',
        50,
      ),
    ]);

    const atStart: string = await deliverAmbientMemory(
      projectDir,
      { sessionId: 'sess-1', prompt: '', phase: 'session-start' },
      100,
    );

    expect(atStart).toBe('');
    const atPrompt: string = await deliverAmbientMemory(
      projectDir,
      query('anything'),
      200,
    );
    expect(atPrompt).toContain('export endpoints stay paginated');
    expect(atPrompt).toContain('In this project, always tag.');
  });

  it('carries an expired proposal no longer', async () => {
    const candidate: StagedCandidate = stageCandidate(
      { principle: 'In this project, always tag.', score: 0.7 },
      'sess-1',
      50,
    );
    await writeStagedCandidates(projectDir, [candidate]);

    expect(
      await deliverAmbientMemory(
        projectDir,
        query('anything'),
        candidate.expiresAt + 1,
      ),
    ).toBe('');
  });

  it('carries no profile content', async () => {
    await writeProfile(projectDir, {
      stack: ['typescript'],
      layout: ['src'],
      entryCommands: ['pnpm test'],
      derivedAt: 10,
    });

    expect(await deliverAmbientMemory(projectDir, query('anything'), 100)).toBe(
      '',
    );
  });

  it('degrades to carrying nothing when the store cannot be read', async () => {
    const paths: MemoryStorePaths = new MemoryStorePaths(projectDir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.notepad, 'not json at all', 'utf8');
    await writeFile(paths.knowledge, 'not json at all', 'utf8');
    await writeFile(paths.rules, 'not json at all', 'utf8');

    expect(
      await deliverAmbientMemory(projectDir, query('deploy now'), 100),
    ).toBe('');
  });
});
