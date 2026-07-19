import type { ArtifactValidation } from '../artifact/artifact-validation';

export function buildRepairPrompt(
  validation: ArtifactValidation,
  schemaText: string,
): string {
  const report: string = validation.missing
    ? 'The declared artifact was missing.'
    : validation.errors.map((error: string): string => `- ${error}`).join('\n');

  return [
    'Your previous artifact did not pass validation.',
    `Validation report:\n${report}`,
    `The artifact must conform to this JSON Schema:\n${schemaText}`,
    'Rewrite the artifact at its declared path so that it conforms. Write no other file, then end your turn.',
  ].join('\n\n');
}
