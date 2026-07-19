import type { Interface } from 'node:readline';
import type { OutputWriter } from '../io/output-writer';
import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';
import type { PipelineGate } from './pipeline-gate';

type LineResolver = (line: string | null) => void;

const APPROVE: ReadonlySet<string> = new Set(['approve', 'a', 'y', 'yes']);
const REJECT: ReadonlySet<string> = new Set(['reject', 'r', 'n', 'no']);

export function createStdinGate(
  reader: Interface,
  write: OutputWriter,
): PipelineGate {
  const buffered: string[] = [];
  const waiting: LineResolver[] = [];
  let ended: boolean = false;

  reader.on('line', (line: string): void => {
    const next: LineResolver | undefined = waiting.shift();
    if (next === undefined) {
      buffered.push(line);
      return;
    }
    next(line);
  });

  reader.on('close', (): void => {
    ended = true;
    for (const next of waiting.splice(0)) {
      next(null);
    }
  });

  const nextLine = (): Promise<string | null> => {
    const line: string | undefined = buffered.shift();
    if (line !== undefined) {
      return Promise.resolve(line);
    }
    if (ended) {
      return Promise.resolve(null);
    }
    return new Promise<string | null>((resolve: LineResolver): void => {
      waiting.push(resolve);
    });
  };

  return async (presentation: GatePresentation): Promise<GateDecision> => {
    write(render(presentation));
    const answer: string | null = await nextLine();
    if (answer === null) {
      return 'none';
    }
    const normalized: string = answer.trim().toLowerCase();
    if (APPROVE.has(normalized)) {
      return 'approve';
    }
    if (REJECT.has(normalized)) {
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
