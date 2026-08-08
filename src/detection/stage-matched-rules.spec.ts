import { describe, expect, it } from 'vitest';
import { contentHash } from '../memory/content-hash';
import type { RuleEntry } from '../memory/rule-entry';
import { RUN_ID_ENV } from '../observability/run-id-env';
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
      {},
      1_000,
    );

    expect(staged).toHaveLength(1);
    expect(staged[0]?.text).toBe(MIGRATIONS.text);
    expect(staged[0]?.deliveredAt).toBeNull();
  });

  it('stages nothing for a path no rule governs', () => {
    expect(
      stageMatchedRules([], [MIGRATIONS], 'src/index.ts', {}, 1_000),
    ).toEqual([]);
  });

  it('stages nothing in a contractual session', () => {
    expect(
      stageMatchedRules(
        [],
        [MIGRATIONS],
        'db/migrations/001.sql',
        { [RUN_ID_ENV]: 'run-7' },
        1_000,
      ),
    ).toEqual([]);
  });

  it('restages a delivered rule when a further matching write occurs', () => {
    const delivered: readonly StagedRule[] = [
      {
        text: MIGRATIONS.text,
        hash: MIGRATIONS.hash,
        stagedAt: 500,
        deliveredAt: 800,
      },
    ];

    const staged: readonly StagedRule[] = stageMatchedRules(
      delivered,
      [MIGRATIONS],
      'db/migrations/002.sql',
      {},
      1_000,
    );

    expect(staged).toHaveLength(1);
    expect(staged[0]?.deliveredAt).toBeNull();
    expect(staged[0]?.stagedAt).toBe(1_000);
  });

  it('leaves the staging it was given untouched', () => {
    const held: readonly StagedRule[] = [];

    stageMatchedRules(held, [MIGRATIONS], 'db/migrations/001.sql', {}, 1_000);

    expect(held).toHaveLength(0);
  });
});
