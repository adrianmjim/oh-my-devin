import { describe, expect, it } from 'vitest';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { EXECUTOR_ROLE_AGENT_MD } from './executor-role-agent-md';

describe('EXECUTOR_ROLE_AGENT_MD', () => {
  it('parses as the executor role definition', () => {
    const role: RoleDefinition = parseRoleDefinition(
      EXECUTOR_ROLE_AGENT_MD,
      'executor',
    );

    expect(role.name).toBe('executor');
    expect(role.outputArtifact).toBe('evidence.json');
  });

  it('declares the schema its artifact is validated against', () => {
    const role: RoleDefinition = parseRoleDefinition(
      EXECUTOR_ROLE_AGENT_MD,
      'executor',
    );

    expect(role.outputSchema).toBe('.devin/schemas/evidence.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    const role: RoleDefinition = parseRoleDefinition(
      EXECUTOR_ROLE_AGENT_MD,
      'executor',
    );

    expect(role.maxTurns).toBeGreaterThan(0);
    expect(role.contextPolicy).toBe('isolated');
  });
});
