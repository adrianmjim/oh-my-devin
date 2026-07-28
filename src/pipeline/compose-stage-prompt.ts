import { REWORK_FRAMING } from './rework-framing';
import type { StageRequest } from './stage-request';

export function composeStagePrompt(request: StageRequest): string {
  const sections: string[] = [];
  const requirements: string | undefined = request.inputs.get('requirements');
  if (requirements !== undefined) {
    sections.push(requirements);
  }
  if (request.reworkFrom !== null) {
    sections.push(REWORK_FRAMING);
  }
  for (const [name, content] of request.inputs) {
    if (name !== 'requirements') {
      sections.push(`## ${name}\n${content}`);
    }
  }
  return sections.join('\n\n');
}
