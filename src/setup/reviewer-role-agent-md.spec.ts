import { describe, expect, it } from 'vitest';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { REVIEWER_ROLE_AGENT_MD } from './reviewer-role-agent-md';

describe('REVIEWER_ROLE_AGENT_MD', () => {
  it('parses as the reviewer role definition', () => {
    const role: RoleDefinition = parseRoleDefinition(
      REVIEWER_ROLE_AGENT_MD,
      'reviewer',
    );

    expect(role.name).toBe('reviewer');
    expect(role.outputArtifact).toBe('review.json');
  });

  it('declares the schema its artifact is validated against', () => {
    const role: RoleDefinition = parseRoleDefinition(
      REVIEWER_ROLE_AGENT_MD,
      'reviewer',
    );

    expect(role.outputSchema).toBe('.devin/schemas/review.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    const role: RoleDefinition = parseRoleDefinition(
      REVIEWER_ROLE_AGENT_MD,
      'reviewer',
    );

    expect(role.maxTurns).toBeGreaterThan(0);
    expect(role.contextPolicy).toBe('isolated');
  });
});
