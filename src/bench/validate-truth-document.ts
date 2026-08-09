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
import type { TruthParser } from './truth-parser';

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
  const parsers: Record<BenchRole, TruthParser> = {
    reviewer: parseReviewerTruth,
    architect: parseArchitectTruth,
    executor: parseExecutorTruth,
    critic: parseCriticTruth,
    analyst: parseAnalystTruth,
    'security-reviewer': parseSecurityReviewerTruth,
    debugger: parseDebuggerTruth,
    explore: parseExploreTruth,
    'document-specialist': parseDocumentSpecialistTruth,
  };
  return parsers[role](fields, source);
}
