import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AMBIENT_KNOWLEDGE_ENTRY_CAP } from '../memory/ambient-knowledge-entry-cap';
import { AMBIENT_PRIORITY_ENTRY_CAP } from '../memory/ambient-priority-entry-cap';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import { writeKnowledge } from '../memory/write-knowledge';
import type { AmbientMemory } from './ambient-memory';
import { composeAmbientMemory } from './compose-ambient-memory';
import type { StagedCandidate } from './staged-candidate';
import type { StagedRule } from './staged-rule';
import { writeStagedCandidates } from './write-staged-candidates';
import { writeStagedRules } from './write-staged-rules';

const CANDIDATE: StagedCandidate = {
  principle: 'In this project, always run the linter before pushing.',
  confirmingCommand:
    'omd memory remember "In this project, always run the linter before pushing."',
  score: 0.8,
  expiresAt: 5_000,
  deliveredAt: null,
};

const RULE: StagedRule = {
  text: 'the data owner reviews migrations',
  hash: 'abc',
  stagedAt: 100,
  deliveredAt: null,
};

const KNOWLEDGE: KnowledgeEntry = {
  text: 'the release gate is manual',
  triggers: ['release'],
  hash: 'def',
  recordedAt: 5,
};

describe('composeAmbientMemory', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-ambient-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('carries nothing when the project remembers nothing', async () => {
    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'cut the release',
      1_000,
    );

    expect(ambient).toEqual({
      priority: [],
      proposals: [],
      knowledge: [],
      rules: [],
    });
  });

  it('carries the notepad priority entries', async () => {
    await appendNotepadEntry(projectDir, 'priority', 'the gate is manual', 5);
    await appendNotepadEntry(projectDir, 'manual', 'a plain note', 6);

    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'anything',
      1_000,
    );

    expect(ambient.priority).toHaveLength(1);
    expect(ambient.priority[0]?.text).toBe('the gate is manual');
  });

  it('carries the staged proposals awaiting confirmation', async () => {
    await writeStagedCandidates(projectDir, [CANDIDATE]);

    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'anything',
      1_000,
    );

    expect(ambient.proposals).toHaveLength(1);
    expect(ambient.proposals[0]?.confirmingCommand).toBe(
      CANDIDATE.confirmingCommand,
    );
  });

  it('carries no proposal that was already delivered', async () => {
    await writeStagedCandidates(projectDir, [
      { ...CANDIDATE, deliveredAt: 900 },
    ]);

    expect(
      (await composeAmbientMemory(projectDir, 'anything', 1_000)).proposals,
    ).toEqual([]);
  });

  it('carries the knowledge the prompt triggers and no other', async () => {
    await writeKnowledge(projectDir, [
      KNOWLEDGE,
      {
        text: 'migrations run forward only',
        triggers: ['migration'],
        hash: 'ghi',
        recordedAt: 6,
      },
    ]);

    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'cut the release branch',
      1_000,
    );

    expect(
      ambient.knowledge.map((entry: KnowledgeEntry): string => entry.text),
    ).toEqual([KNOWLEDGE.text]);
  });

  it('carries the rules a matching write staged', async () => {
    await writeStagedRules(projectDir, [RULE]);

    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'anything',
      1_000,
    );

    expect(ambient.rules).toHaveLength(1);
    expect(ambient.rules[0]?.text).toBe(RULE.text);
  });

  it('bounds every class it carries', async () => {
    for (
      let index: number = 0;
      index < AMBIENT_PRIORITY_ENTRY_CAP + 3;
      index++
    ) {
      await appendNotepadEntry(
        projectDir,
        'priority',
        `priority ${String(index)}`,
        index,
      );
    }
    await writeKnowledge(
      projectDir,
      Array.from(
        { length: AMBIENT_KNOWLEDGE_ENTRY_CAP + 3 },
        (_unused: unknown, index: number): KnowledgeEntry => ({
          text: `fact ${String(index)}`,
          triggers: ['release'],
          hash: `hash-${String(index)}`,
          recordedAt: index,
        }),
      ),
    );

    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'cut the release',
      1_000,
    );

    expect(ambient.priority).toHaveLength(AMBIENT_PRIORITY_ENTRY_CAP);
    expect(ambient.knowledge).toHaveLength(AMBIENT_KNOWLEDGE_ENTRY_CAP);
  });

  it('degrades silently when the store cannot be read', async () => {
    const paths: MemoryStorePaths = new MemoryStorePaths(projectDir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.notepad, '{ not json', 'utf8');
    await writeFile(paths.knowledge, 'not json either', 'utf8');

    const ambient: AmbientMemory = await composeAmbientMemory(
      projectDir,
      'cut the release',
      1_000,
    );

    expect(ambient.priority).toEqual([]);
    expect(ambient.knowledge).toEqual([]);
  });

  it('never reads the profile class', async () => {
    await composeAmbientMemory(projectDir, 'anything', 1_000);

    await expect(
      rm(new MemoryStorePaths(projectDir).profile),
    ).rejects.toThrow();
  });
});
