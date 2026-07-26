import { describe, expect, it } from 'vitest';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { ARCHITECT_ROLE_AGENT_MD } from './architect-role-agent-md';

describe('ARCHITECT_ROLE_AGENT_MD', () => {
  it('parses as the architect role definition', () => {
    const role: RoleDefinition = parseRoleDefinition(
      ARCHITECT_ROLE_AGENT_MD,
      'architect',
    );

    expect(role.name).toBe('architect');
    expect(role.outputArtifact).toBe('architecture.json');
  });

  it('declares the schema its artifact is validated against', () => {
    const role: RoleDefinition = parseRoleDefinition(
      ARCHITECT_ROLE_AGENT_MD,
      'architect',
    );

    expect(role.outputSchema).toBe('.devin/schemas/architecture.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    const role: RoleDefinition = parseRoleDefinition(
      ARCHITECT_ROLE_AGENT_MD,
      'architect',
    );

    expect(role.maxTurns).toBeGreaterThan(0);
    expect(role.contextPolicy).toBe('isolated');
  });
});
