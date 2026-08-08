import { BenchFixtureError } from './bench-fixture-error';
import type { BenchRole } from './bench-role';
import { isBenchRole } from './is-bench-role';
import { parseAnalystTruth } from './parse-analyst-truth';
import { parseArchitectTruth } from './parse-architect-truth';
import { parseCriticTruth } from './parse-critic-truth';
import { parseDebuggerTruth } from './parse-debugger-truth';
import { parseDocumentSpecialistTruth } from './parse-document-specialist-truth';
import { parseExecutorTruth } from './parse-executor-truth';
import { parseExploreTruth } from './parse-explore-truth';
import { parseReviewerTruth } from './parse-reviewer-truth';
import { parseSecurityReviewerTruth } from './parse-security-reviewer-truth';
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
      `"${source}#role" must name an installed catalog role`,
    );
  }
  const named: BenchRole = role;
  let document: TruthDocument;
  if (named === 'reviewer') {
    document = parseReviewerTruth(fields, source);
  } else if (named === 'architect') {
    document = parseArchitectTruth(fields, source);
  } else if (named === 'executor') {
    document = parseExecutorTruth(fields, source);
  } else if (named === 'critic') {
    document = parseCriticTruth(fields, source);
  } else if (named === 'analyst') {
    document = parseAnalystTruth(fields, source);
  } else if (named === 'security-reviewer') {
    document = parseSecurityReviewerTruth(fields, source);
  } else if (named === 'debugger') {
    document = parseDebuggerTruth(fields, source);
  } else if (named === 'explore') {
    document = parseExploreTruth(fields, source);
  } else {
    document = parseDocumentSpecialistTruth(fields, source);
  }
  return document;
}
