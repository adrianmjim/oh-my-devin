import type { GatePresentation } from './gate-presentation';

export function renderGatePresentation(presentation: GatePresentation): string {
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
