import { BenchFixtureError } from './bench-fixture-error';
import type { DocumentSpecialistArtifact } from './document-specialist-artifact';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';
import type { SourcedAnswer } from './sourced-answer';

export function parseDocumentSpecialistArtifact(
  value: unknown,
  source: string,
): DocumentSpecialistArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const answers: unknown = fields['answers'];
  if (!Array.isArray(answers)) {
    throw new BenchFixtureError(`"${source}#answers" must be an array`);
  }
  return {
    answers: answers.map((entry: unknown, index: number): SourcedAnswer => {
      const at: string = `${source}#answers[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      return {
        text: [
          requireBenchString(item['question'], `${at}.question`),
          requireBenchString(item['answer'], `${at}.answer`),
        ].join(' '),
        source: requireBenchString(item['source'], `${at}.source`),
      };
    }),
  };
}
