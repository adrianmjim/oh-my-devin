import { deliverGuardNotices } from '../guard/deliver-guard-notices';
import { AMBIENT_PRIORITY_ENTRY_CAP } from '../memory/ambient-priority-entry-cap';
import type { NotepadEntry } from '../memory/notepad-entry';
import { readNotepad } from '../memory/read-notepad';
import { deriveRunListing } from '../observability/derive-run-listing';
import { LIVENESS_STALL_THRESHOLD_MS } from '../observability/liveness-stall-threshold-ms';
import type { RunListing } from '../observability/run-listing';
import type { RunListingEntry } from '../observability/run-listing-entry';
import { deriveSessionInjection } from './derive-session-injection';
import type { SessionId } from './session-id';

export async function deriveAmbientContext(
  baseDir: string,
  sessionId: SessionId | null,
  now: number,
): Promise<string> {
  const modes: string = await deriveSessionInjection(baseDir, sessionId, now);
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
  const notices: string = await deliverGuardNotices(baseDir, sessionId);
  if (notices !== '') {
    sections.push(notices);
  }
  const notes: readonly NotepadEntry[] = (await readNotepad(baseDir))
    .filter((entry: NotepadEntry): boolean => entry.kind === 'priority')
    .slice(-AMBIENT_PRIORITY_ENTRY_CAP);
  if (notes.length > 0) {
    sections.push(
      [
        'Project memory (omd, priority notes):',
        ...notes.map((entry: NotepadEntry): string => `- ${entry.text}`),
      ].join('\n'),
    );
  }
  return sections.join('\n\n');
}
