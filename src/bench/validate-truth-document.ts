import type { BenchRole } from './bench-role';
import { BenchFixtureError } from './bench-fixture-error';
import { isBenchRole } from './is-bench-role';
import { parseArchitectTruth } from './parse-architect-truth';
import { parseExecutorTruth } from './parse-executor-truth';
import { parseReviewerTruth } from './parse-reviewer-truth';
import { requireBenchFields } from './require-bench-fields';
import type { TruthDocument } from './truth-document';

export function validateTruthDocument(
  value: unknown,
  source: string,
): TruthDocument {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const role: unknown = fields['role'];
  if (!isBenchRole(role)) {
    throw new BenchFixtureError(
      `"${source}#role" must be reviewer, architect or executor`,
    );
  }
  const named: BenchRole = role;
  let document: TruthDocument;
  if (named === 'reviewer') {
    document = parseReviewerTruth(fields, source);
  } else if (named === 'architect') {
    document = parseArchitectTruth(fields, source);
  } else {
    document = parseExecutorTruth(fields, source);
  }
  return document;
}
