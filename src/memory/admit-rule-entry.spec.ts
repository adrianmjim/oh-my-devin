import { describe, expect, it } from 'vitest';
import { admitRuleEntry } from './admit-rule-entry';
import { contentHash } from './content-hash';
import { MEMORY_CLASS_CAP } from './memory-class-cap';
import type { RuleEntry } from './rule-entry';

function entry(
  text: string,
  recordedAt: number,
  globs: readonly string[] = ['src/**'],
): RuleEntry {
  return { text, globs, hash: contentHash(text), recordedAt };
}

describe('admitRuleEntry', () => {
  it('admits a rule the class does not hold yet', () => {
    expect(admitRuleEntry([], entry('review migrations', 10))).toHaveLength(1);
  });

  it('collapses identical text to a single rule', () => {
    const first: readonly RuleEntry[] = admitRuleEntry(
      [],
      entry('review migrations', 10),
    );

    const second: readonly RuleEntry[] = admitRuleEntry(
      first,
      entry('review migrations', 20, ['db/**']),
    );

    expect(second).toHaveLength(1);
    expect(second[0]?.recordedAt).toBe(10);
  });

  it('holds the class within its omd-owned cap', () => {
    const saturated: readonly RuleEntry[] = Array.from(
      { length: MEMORY_CLASS_CAP.rules },
      (_unused: unknown, index: number): RuleEntry =>
        entry(`rule ${index}`, index),
    );

    expect(admitRuleEntry(saturated, entry('one more', 9_000))).toHaveLength(
      MEMORY_CLASS_CAP.rules,
    );
  });
});
