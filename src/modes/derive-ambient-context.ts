import type { AmbientQuery } from '../detection/ambient-query';
import { deliverAmbientMemory } from '../detection/deliver-ambient-memory';
import { deriveRunListing } from '../observability/derive-run-listing';
import { LIVENESS_STALL_THRESHOLD_MS } from '../observability/liveness-stall-threshold-ms';
import type { RunListing } from '../observability/run-listing';
import type { RunListingEntry } from '../observability/run-listing-entry';
import { deriveSessionInjection } from './derive-session-injection';

export async function deriveAmbientContext(
  baseDir: string,
  query: AmbientQuery,
  now: number,
): Promise<string> {
  const modes: string = await deriveSessionInjection(
    baseDir,
    query.sessionId,
    now,
  );
  const sections: string[] = [
    modes === '' ? 'Oh My Devin layer active.' : modes,
  ];
  let listing: RunListing | null;
  try {
    listing = await deriveRunListing(baseDir, now, LIVENESS_STALL_THRESHOLD_MS);
  } catch {
    listing = null;
  }
  if (listing !== null && listing.runs.length > 0) {
    sections.push(
      [
        'Project runs (omd status):',
        ...listing.runs.map(
          (run: RunListingEntry): string =>
            `- ${run.runId} ${run.state}${run.pendingGate === null ? '' : ` gate ${run.pendingGate}`}`,
        ),
      ].join('\n'),
    );
  }
  const memory: string = await deliverAmbientMemory(baseDir, query, now);
  if (memory !== '') {
    sections.push(memory);
  }
  return sections.join('\n\n');
}
