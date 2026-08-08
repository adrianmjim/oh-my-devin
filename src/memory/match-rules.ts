import { globToRegExp } from './glob-to-reg-exp';
import type { RuleEntry } from './rule-entry';

export function matchRules(
  rules: readonly RuleEntry[],
  path: string,
): readonly RuleEntry[] {
  return path === ''
    ? []
    : rules.filter((rule: RuleEntry): boolean =>
        rule.globs.some((glob: string): boolean =>
          globToRegExp(glob).test(path),
        ),
      );
}
