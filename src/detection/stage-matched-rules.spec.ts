import { describe, expect, it } from 'vitest';
import { contentHash } from '../memory/content-hash';
import { RULE_EXPIRY_WINDOW_MS } from './rule-expiry-window-ms';
import type { RuleEntry } from '../memory/rule-entry';
import { stageMatchedRules } from './stage-matched-rules';
import type { StagedRule } from './staged-rule';

function rule(text: string, globs: readonly string[]): RuleEntry {
  return { text, globs, hash: contentHash(text), recordedAt: 1 };
}

const MIGRATIONS: RuleEntry = rule('the data owner reviews migrations', [
  'db/migrations/**',
]);

describe('stageMatchedRules', () => {
  it('stages the rule a matching write touches', () => {
    const staged: readonly StagedRule[] = stageMatchedRules(
      [],
      [MIGRATIONS],
      'db/migrations/001.sql',
      'sess-1',
      1_000,
    );

    expect(staged).toHaveLength(1);
    expect(staged[0]?.text).toBe(MIGRATIONS.text);
    expect(staged[0]?.deliveredAt).toBeNull();
  });

  it('stages the rule for the session whose write touched it', () => {
    const staged: readonly StagedRule[] = stageMatchedRules(
      [],
      [MIGRATIONS],
      'db/migrations/001.sql',
      'sess-1',
      1_000,
    );

    expect(staged[0]?.sessionId).toBe('sess-1');
  });

  it('stamps the expiry window at staging', () => {
    const staged: readonly StagedRule[] = stageMatchedRules(
      [],
      [MIGRATIONS],
      'db/migrations/001.sql',
      'sess-1',
      1_000,
    );

    expect(staged[0]?.expiresAt).toBe(1_000 + RULE_EXPIRY_WINDOW_MS);
  });

  it('stages nothing for a path no rule governs', () => {
    expect(
      stageMatchedRules([], [MIGRATIONS], 'src/index.ts', 'sess-1', 1_000),
    ).toEqual([]);
  });

  it('restages a delivered rule when a further matching write occurs', () => {
    const delivered: readonly StagedRule[] = [
      {
        text: MIGRATIONS.text,
        hash: MIGRATIONS.hash,
        sessionId: 'sess-1',
        stagedAt: 500,
        expiresAt: 10_000,
        deliveredAt: 800,
      },
    ];

    const staged: readonly StagedRule[] = stageMatchedRules(
      delivered,
      [MIGRATIONS],
      'db/migrations/002.sql',
      'sess-1',
      1_000,
    );

    expect(staged).toHaveLength(1);
    expect(staged[0]?.deliveredAt).toBeNull();
    expect(staged[0]?.stagedAt).toBe(1_000);
  });

  it('holds another session staging of the same rule alongside', () => {
    const other: readonly StagedRule[] = [
      {
        text: MIGRATIONS.text,
        hash: MIGRATIONS.hash,
        sessionId: 'sess-other',
        stagedAt: 500,
        expiresAt: 10_000,
        deliveredAt: null,
      },
    ];

    const staged: readonly StagedRule[] = stageMatchedRules(
      other,
      [MIGRATIONS],
      'db/migrations/002.sql',
      'sess-1',
      1_000,
    );

    expect(staged).toHaveLength(2);
    expect(
      staged.map((entry: StagedRule): string | null => entry.sessionId),
    ).toEqual(['sess-other', 'sess-1']);
  });

  it('drops a delivered staging of any session on rebuild', () => {
    const delivered: readonly StagedRule[] = [
      {
        text: MIGRATIONS.text,
        hash: MIGRATIONS.hash,
        sessionId: 'sess-other',
        stagedAt: 500,
        expiresAt: 10_000,
        deliveredAt: 800,
      },
    ];

    expect(
      stageMatchedRules(
        delivered,
        [MIGRATIONS],
        'src/index.ts',
        'sess-1',
        1_000,
      ),
    ).toEqual([]);
  });

  it('drops an expired staging on rebuild', () => {
    const expired: readonly StagedRule[] = [
      {
        text: MIGRATIONS.text,
        hash: MIGRATIONS.hash,
        sessionId: 'sess-other',
        stagedAt: 500,
        expiresAt: 900,
        deliveredAt: null,
      },
    ];

    expect(
      stageMatchedRules(expired, [MIGRATIONS], 'src/index.ts', 'sess-1', 1_000),
    ).toEqual([]);
  });

  it('leaves the staging it was given untouched', () => {
    const held: readonly StagedRule[] = [];

    stageMatchedRules(
      held,
      [MIGRATIONS],
      'db/migrations/001.sql',
      'sess-1',
      1_000,
    );

    expect(held).toHaveLength(0);
  });
});
