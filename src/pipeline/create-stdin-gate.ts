import type { LineReader } from '../io/line-reader';
import type { OutputWriter } from '../io/output-writer';
import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';
import type { PipelineGate } from './pipeline-gate';

const APPROVE: ReadonlySet<string> = new Set(['approve', 'a', 'y', 'yes']);
const REJECT: ReadonlySet<string> = new Set(['reject', 'r', 'n', 'no']);

export function createStdinGate(
  read: LineReader,
  write: OutputWriter,
): PipelineGate {
  return async (presentation: GatePresentation): Promise<GateDecision> => {
    write(render(presentation));
    const answer: string = (await read()).trim().toLowerCase();
    if (APPROVE.has(answer)) {
      return 'approve';
    }
    if (REJECT.has(answer)) {
      return 'reject';
    }
    return 'none';
  };
}

function render(presentation: GatePresentation): string {
  const outcome: string =
    presentation.report.failureTier === null
      ? 'succeeded'
      : `failed (${presentation.report.failureTier})`;
  return [
    `Stage "${presentation.stage}" ${outcome}.`,
    `  artifact: ${presentation.report.artifactPath} (valid: ${presentation.report.artifactValid})`,
    `  session: ${presentation.report.sessionId ?? '(none)'}`,
    'Approve this stage? [approve/reject]',
  ].join('\n');
}
