import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { EXECUTOR_ROLE_AGENT_MD } from './executor-role-agent-md';
import { EXECUTOR_ROLE_SCHEMA } from './executor-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  EXECUTOR_ROLE_AGENT_MD,
  'executor',
);
const SCHEMA: object = JSON.parse(EXECUTOR_ROLE_SCHEMA) as object;

describe('EXECUTOR_ROLE_AGENT_MD', () => {
  it('parses as the executor role definition', () => {
    expect(ROLE.name).toBe('executor');
    expect(ROLE.outputArtifact).toBe('evidence.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/evidence.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('grants the toolset its verification needs', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit', 'exec']);
  });

  it('writes only its own artifact and runs the commands it reports', () => {
    expect(ROLE.permissions.allow).toEqual([
      'Write(evidence.json)',
      'Exec(**)',
    ]);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as building the architecture into evidence', () => {
    expect(ROLE.promptBody).toContain('architecture.json');
    expect(ROLE.promptBody).toContain('evidence.json');
  });

  it('hands design and judgement to the roles that own them', () => {
    expect(ROLE.promptBody).toContain('architect');
    expect(ROLE.promptBody).toContain('reviewer');
    expect(ROLE.promptBody).toContain('review.json');
  });

  it('frames its own failure as honest failing evidence, not a retry loop', () => {
    expect(ROLE.promptBody).toContain('`failed`');
  });

  it('models a good example the installed schema accepts', () => {
    expect(
      validateAgainstSchema(
        JSON.parse(goodExampleBlock(ROLE.promptBody)),
        SCHEMA,
      ),
    ).toEqual([]);
  });

  it('honors the generic role contract', () => {
    assertGenericRoleContract(ROLE);
  });
});
