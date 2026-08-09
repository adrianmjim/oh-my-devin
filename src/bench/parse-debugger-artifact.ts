import { BenchFixtureError } from './bench-fixture-error';
import type { DebuggerArtifact } from './debugger-artifact';
import type { DebuggerRootCause } from './debugger-root-cause';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseDebuggerArtifact(
  value: unknown,
  source: string,
): DebuggerArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const evidence: unknown = fields['evidence'];
  if (!Array.isArray(evidence) || evidence.length === 0) {
    throw new BenchFixtureError(
      `"${source}#evidence" must be a non-empty array`,
    );
  }
  const rootCauseRaw: unknown = fields['rootCause'];
  let rootCause: DebuggerRootCause | null;
  if (rootCauseRaw === undefined || rootCauseRaw === null) {
    rootCause = null;
  } else {
    const at: string = `${source}#rootCause`;
    const cause: Record<string, unknown> = requireBenchFields(rootCauseRaw, at);
    rootCause = {
      location: requireBenchString(cause['location'], `${at}.location`),
      text: [
        requireBenchString(cause['explanation'], `${at}.explanation`),
        requireBenchString(cause['fixDirection'], `${at}.fixDirection`),
      ].join(' '),
    };
  }

  const notIsolatedRaw: unknown = fields['notIsolated'];
  let eliminated: readonly string[] = [];
  if (notIsolatedRaw !== undefined && notIsolatedRaw !== null) {
    const at: string = `${source}#notIsolated`;
    const stated: Record<string, unknown> = requireBenchFields(
      notIsolatedRaw,
      at,
    );
    const hypotheses: unknown = stated['eliminatedHypotheses'];
    if (!Array.isArray(hypotheses)) {
      throw new BenchFixtureError(
        `"${at}.eliminatedHypotheses" must be an array`,
      );
    }
    eliminated = hypotheses.map((entry: unknown, index: number): string =>
      requireBenchString(entry, `${at}.eliminatedHypotheses[${index}]`),
    );
  }

  return {
    evidence: evidence.map((entry: unknown, index: number): string => {
      const at: string = `${source}#evidence[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      return [
        requireBenchString(item['source'], `${at}.source`),
        requireBenchString(item['observation'], `${at}.observation`),
      ].join(' ');
    }),
    rootCause,
    eliminated,
  };
}
