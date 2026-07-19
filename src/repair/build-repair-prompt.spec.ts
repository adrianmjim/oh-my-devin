import { describe, expect, it } from 'vitest';
import type { ArtifactValidation } from '../artifact/artifact-validation';
import { buildRepairPrompt } from './build-repair-prompt';

const SCHEMA_TEXT: string = '{"type":"object","required":["verdict"]}';

describe('buildRepairPrompt', () => {
  it('feeds each validation error and the declared schema', () => {
    const validation: ArtifactValidation = {
      valid: false,
      missing: false,
      errors: ['(root) must have required property verdict'],
    };

    const prompt: string = buildRepairPrompt(validation, SCHEMA_TEXT);

    expect(prompt).toContain('must have required property verdict');
    expect(prompt).toContain(SCHEMA_TEXT);
  });

  it('states that the artifact was missing when it never existed', () => {
    const validation: ArtifactValidation = {
      valid: false,
      missing: true,
      errors: ['artifact is missing at "review.json"'],
    };

    const prompt: string = buildRepairPrompt(validation, SCHEMA_TEXT);

    expect(prompt.toLowerCase()).toContain('missing');
    expect(prompt).toContain(SCHEMA_TEXT);
  });
});
