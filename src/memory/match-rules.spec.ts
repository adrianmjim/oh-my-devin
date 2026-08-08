import { describe, expect, it } from 'vitest';
import { contentHash } from './content-hash';
import { matchRules } from './match-rules';
import type { RuleEntry } from './rule-entry';

function entry(text: string, globs: readonly string[]): RuleEntry {
  return { text, globs, hash: contentHash(text), recordedAt: 1 };
}

const MIGRATIONS: RuleEntry = entry('the data owner reviews migrations', [
  'db/migrations/**',
]);
const DOCS: RuleEntry = entry('docs ship with the feature', ['docs/**']);

describe('matchRules', () => {
  it('matches the rule governing the path that was touched', () => {
    expect(
      matchRules([MIGRATIONS, DOCS], 'db/migrations/001-init.sql'),
    ).toEqual([MIGRATIONS]);
  });

  it('matches a rule carrying any one of its globs', () => {
    const either: RuleEntry = entry('review it', ['db/**', 'docs/**']);

    expect(matchRules([either], 'docs/guide.md')).toEqual([either]);
  });

  it('excludes every rule the path governs nothing of', () => {
    expect(matchRules([MIGRATIONS, DOCS], 'src/index.ts')).toEqual([]);
  });

  it('matches nothing for a rule carrying no globs', () => {
    expect(matchRules([entry('no globs', [])], 'src/index.ts')).toEqual([]);
  });

  it('reads a path outside the project as governed by nothing', () => {
    expect(matchRules([MIGRATIONS], '')).toEqual([]);
  });
});
