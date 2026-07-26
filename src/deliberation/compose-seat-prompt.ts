import { renderClarifications } from './render-clarifications';
import { renderPriorArguments } from './render-prior-arguments';
import type { SeatInvocation } from './seat-invocation';

export function composeSeatPrompt(invocation: SeatInvocation): string {
  const sections: string[] = [
    `You hold the "${invocation.seat.lens}" lens on this council.`,
  ];
  if (invocation.seat.contrarian) {
    sections.push(
      'You are the contrarian seat: challenge the emerging consensus and surface the strongest objection even if you would otherwise consent.',
    );
  }
  sections.push(
    invocation.phase === 'clarification'
      ? 'Before taking a position, pose the clarification questions you need answered about the proposal. Write your artifact as {"kind": "clarification", "questions": [...]}; use an empty array when nothing needs clarification.'
      : 'Assess the proposal through your lens and state your position.',
  );
  sections.push(`## Question\n${invocation.question}`);
  sections.push(`## Proposal\n${invocation.proposal}`);
  if (invocation.clarifications.length > 0) {
    sections.push(
      `## Clarifications\n${renderClarifications(invocation.clarifications)}`,
    );
  }
  if (invocation.evidenceSummary !== null) {
    sections.push(`## Evidence summary\n${invocation.evidenceSummary}`);
  }
  if (invocation.priorArguments.length > 0) {
    sections.push(
      `## Prior arguments\n${renderPriorArguments(invocation.priorArguments)}`,
    );
  }
  return sections.join('\n\n');
}
