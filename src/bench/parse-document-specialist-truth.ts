import { BenchFixtureError } from './bench-fixture-error';
import type { DocumentSpecialistTruthDocument } from './document-specialist-truth-document';
import type { DocumentSpecialistTruthItem } from './document-specialist-truth-item';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseDocumentSpecialistTruth(
  fields: Record<string, unknown>,
  source: string,
): DocumentSpecialistTruthDocument {
  const answers: unknown = fields['answers'];
  if (!Array.isArray(answers)) {
    throw new BenchFixtureError(`"${source}#answers" must be an array`);
  }
  return {
    role: 'document-specialist',
    answers: answers.map(
      (entry: unknown, index: number): DocumentSpecialistTruthItem => {
        const at: string = `${source}#answers[${index}]`;
        const item: Record<string, unknown> = requireBenchFields(entry, at);
        return {
          id: requireBenchString(item['id'], `${at}.id`),
          keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
          source: requireBenchString(item['source'], `${at}.source`),
        };
      },
    ),
  };
}
