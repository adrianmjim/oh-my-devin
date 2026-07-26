import type { ProposerRequest } from './proposer-request';
import { renderBlockingObjections } from './render-blocking-objections';
import { renderClarificationQuestions } from './render-clarification-questions';

export function composeProposerPrompt(request: ProposerRequest): string {
  const sections: string[] = [`## Question\n${request.question}`];
  if (request.currentProposal === null) {
    sections.push('Draft a proposal that answers the question.');
    return sections.join('\n\n');
  }
  sections.push(`## Current proposal\n${request.currentProposal}`);
  if (request.clarificationQuestions.length > 0) {
    sections.push(
      `## Clarification questions\n${renderClarificationQuestions(request.clarificationQuestions)}`,
    );
    sections.push(
      'Answer each clarification question about the current proposal in a "clarifications" array of {"question", "answer"} entries, and restate the proposal unchanged in "proposal".',
    );
    return sections.join('\n\n');
  }
  sections.push(
    `## Blocking objections\n${renderBlockingObjections(request.blocking)}`,
  );
  sections.push('Revise the proposal to resolve the blocking objections.');
  return sections.join('\n\n');
}
