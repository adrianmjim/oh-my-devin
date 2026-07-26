import type { Interface } from 'node:readline';
import type { OutputWriter } from '../io/output-writer';
import { APPROVE_ANSWERS } from './approve-answers';
import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';
import type { LineResolver } from './line-resolver';
import type { PipelineGate } from './pipeline-gate';
import { REJECT_ANSWERS } from './reject-answers';
import { renderGatePresentation } from './render-gate-presentation';

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
    write(renderGatePresentation(presentation));
    const answer: string | null = await nextLine();
    if (answer === null) {
      return 'none';
    }
    const normalized: string = answer.trim().toLowerCase();
    if (APPROVE_ANSWERS.has(normalized)) {
      return 'approve';
    }
    if (REJECT_ANSWERS.has(normalized)) {
      return 'reject';
    }
    return 'none';
  };
}
