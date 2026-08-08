import type { ArchitectTruthDocument } from './architect-truth-document';
import type { ArchitectTruthItem } from './architect-truth-item';
import { BenchFixtureError } from './bench-fixture-error';
import { parseArchitectTruthItems } from './parse-architect-truth-items';

export function parseArchitectTruth(
  fields: Record<string, unknown>,
  source: string,
): ArchitectTruthDocument {
  const gaps: unknown = fields['gaps'];
  if (!Array.isArray(gaps)) {
    throw new BenchFixtureError(`"${source}#gaps" must be an array`);
  }
  const spurious: unknown = fields['spurious'] ?? [];
  if (!Array.isArray(spurious)) {
    throw new BenchFixtureError(`"${source}#spurious" must be an array`);
  }
  const closed: readonly ArchitectTruthItem[] = parseArchitectTruthItems(
    gaps,
    `${source}#gaps`,
  );
  return {
    role: 'architect',
    gaps: closed,
    spurious: parseArchitectTruthItems(spurious, `${source}#spurious`),
  };
}
